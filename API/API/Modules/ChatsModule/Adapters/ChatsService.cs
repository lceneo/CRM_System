﻿using API.Extensions;
using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Infrastructure.Extensions;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using API.Modules.ChatsModule.Ports;
using API.Modules.ClientsModule;
using API.Modules.LogsModule;
using API.Modules.ProfilesModule.DTO;
using API.Modules.ProfilesModule.Ports;
using API.Modules.StaticModule.Entities;
using API.Modules.StaticModule.Ports;
using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;

namespace API.Modules.ChatsModule.Adapters;

public class ChatsService : IChatsService
{
    private readonly IChatsRepository chatsRepository;
    private readonly IMessagesRepository messagesRepository;
    private readonly IProfilesRepository profilesRepository;
    private readonly ILog log;
    private readonly IMapper mapper;
    private readonly IHubContext<ChatsHub> chatHub;
    private readonly IStaticsRepository staticsRepository;
    private readonly IClientsRepository clientsRepository;

    public ChatsService(
        ILog log,
        IMapper mapper,
        IChatsRepository chatsRepository,
        IProfilesRepository profilesRepository,
        IMessagesRepository messagesRepository,
        IHubContext<ChatsHub> chatHub,
        IStaticsRepository staticsRepository, 
        IClientsRepository clientsRepository)
    {
        this.log = log;
        this.chatsRepository = chatsRepository;
        this.profilesRepository = profilesRepository;
        this.messagesRepository = messagesRepository;
        this.mapper = mapper;
        this.chatHub = chatHub;
        this.staticsRepository = staticsRepository;
        this.clientsRepository = clientsRepository;
    }

    public async Task<Result<(ChatEntity chat, MessageEntity message)>> SendMessageAsync(
        Guid senderId,
        SendMessageRequest request)
    {
        var lazyUsers = new Lazy<Guid[]>(() => new[] {request.RecipientId, senderId});
        var chat = await chatsRepository.GetByIdAsync(request.RecipientId)
                   ?? await chatsRepository.GetByUsers(new HashSet<Guid>(lazyUsers.Value))
                   ?? await CreateChatWithUsers(lazyUsers.Value);
        if (chat == null)
            return Result.NotFound<(ChatEntity chat, MessageEntity message)>("Неправильный идентификатор чата/пользователя");
        if (chat.Status == ChatStatus.Blocked)
            return Result.BadRequest<(ChatEntity chat, MessageEntity message)>("Чат заблокирован сервисом");

        HashSet<FileEntity> files = null;
        if (request.FileKeys != null)
        {
            files = staticsRepository.Get(request.FileKeys).ToHashSet();
            if (files.Count != request.FileKeys.Count())
                return Result.NotFound<(ChatEntity chat, MessageEntity message)>("Не удалось найти файлы");
        }

        if (chat.Status == ChatStatus.Archived)
        {
            chat.Status = ChatStatus.Active;
            await chatsRepository.UpdateAsync(chat);
            await log.Info($"Chat(Id: {chat.Id}) was Unarchived (Archived -> Active)");
        }
        var messageEntity = new MessageEntity
        {
            Message = request.Message,
            Type = MessageType.Text,
            Chat = chat,
            Sender = chat.Profiles.First(p => p.Id == senderId),
            DateTime = DateTime.Now,
            Files = files ?? new HashSet<FileEntity>(),
            Checks = new HashSet<CheckEntity>(),
        };
        await messagesRepository.CreateAsync(messageEntity);

        await LogMessage(messageEntity, chat.Id);
        return Result.Ok((chat, messageEntity));
    }

    public async Task<Result<CheckMessagesResponse>> CheckMessages(CheckMessagesRequest request, Guid initiatorId)
    {
        var profile = await profilesRepository.GetByIdAsync(initiatorId);
        var messages = messagesRepository.Search(
                request.ChatId,
                new MessagesSearchRequest {MessageIds = request.MessageIds.ToHashSet()},
                true)
            .Items;
        foreach (var message in messages)
        {
            var check = new CheckEntity {Message = message, Profile = profile};
            if (message.Checks == null)
                message.Checks = new HashSet<CheckEntity> {check};
            else
                message.Checks.Add(check);
        }
        await messagesRepository.SaveChangesAsync();

        await log.Info($"Check messages in chat: {request.ChatId} by user: {initiatorId}");
        return Result.Ok(new CheckMessagesResponse
        {
            Checker = mapper.Map<ProfileOutShortDTO>(profile),
            ChatId = request.ChatId,
            MessageIds = request.MessageIds,
        });
    }

    public async Task<Result<SearchResponseBaseDTO<ChatOutDTO>>> SearchChats(Guid userId, ChatsSearchRequest req)
    {
        var searchResp = await chatsRepository.SearchChatsAsync(req);
        return Result.Ok(new SearchResponseBaseDTO<ChatOutDTO>
        {
            TotalCount = searchResp.TotalCount,
            Items = searchResp.Items
                .Select(c => mapper.MapChat(c, userId))
                .ToList(),
        });
    }

    public async Task<Result<(ChatEntity chat, MessageEntity message)>> SendSystemMessage(
        Guid chatId,
        string message)
    {
        var chat = await chatsRepository.GetByIdAsync(chatId);
        if (chat == null)
            return Result.NotFound<(ChatEntity chat, MessageEntity message)>(
                "Неправильный идентификатор чата");
        var messageEntity = new MessageEntity
        {
            Message = message,
            Type = MessageType.System,
            Chat = chat,
            Sender = null,
            DateTime = DateTime.Now,
        };
        await messagesRepository.CreateAsync(messageEntity);

        var receivers = chat.Profiles;
        foreach (var receiver in receivers)
        {
            await chatHub.Clients
                .Group(receiver.Id.ToString())
                .SendAsync("Recieve", mapper.MapMessage(messageEntity, receiver.Id));
        }

        await LogMessage(messageEntity, chatId);
        return Result.Ok((chat, messageEntity));
    }

    private async Task LogMessage(MessageEntity message, Guid chatId)
        => await log.Info($"Message(Id: {message.Id}, Type: {message.Type}) in chat(Id: {chatId}) by user(Id: {message.Sender?.Id})");

    public async Task<Result<IEnumerable<ProfileOutDTO>>> JoinChatAsync(Guid chatId, Guid userId)
    {
        var chat = await chatsRepository.GetByIdAsync(chatId);
        if (chat == null)
            return Result.NotFound<IEnumerable<ProfileOutDTO>>("Такого чата не существует");

        var profile = await profilesRepository.GetByIdAsync(userId);
        if (profile == null)
            return Result.NotFound<IEnumerable<ProfileOutDTO>>("Такого пользователя не существует");

        var participants = mapper.Map<IEnumerable<ProfileOutDTO>>(chat.Profiles);
        chat.Profiles.Add(profile);
        await chatsRepository.UpdateAsync(chat);

        foreach (var participant in participants)
        {
            try
            {
                await chatHub.Clients.Group(participant.Id.ToString()).SendAsync("");
            }
            catch (Exception e)
            {
                // TODO: починить, не работало тк сигнал р пытался кинуть запрос в несуществующую группу
            }
        }

        await SendSystemMessage(chat.Id, $"{profile.Name} вошел в чат");
        await chatHub.Clients.Group("Managers").SendAsync("UpdateFreeChats");

        await log.Info($"User(Id: {userId}) joined in chat(Id: {chatId})");
        return Result.Ok(participants);
    }

    public async Task<Result<bool>> LeaveChatAsync(Guid chatId, Guid userId)
    {
        var chat = await chatsRepository.GetByIdAsync(chatId);
        if (chat == null)
            return Result.NotFound<bool>("Такого чата не существует");

        var profile = await profilesRepository.GetByIdAsync(userId);
        if (profile == null)
            return Result.NotFound<bool>("Такого пользователя не существует");

        if (!chat.Profiles.Contains(profile))
            return Result.BadRequest<bool>("В чате нет такого пользователя");

        chat.Profiles.Remove(profile);
        await chatsRepository.UpdateAsync(chat);
        await chatHub.Clients.Group("Managers").SendAsync("UpdateFreeChats");
        await SendSystemMessage(chat.Id, $"{profile.Name} вышел из чата");

        await log.Info($"UserId(Id: {userId}) leaved chat(Id: {chatId})");
        return Result.NoContent<bool>();
    }

    public async Task<Result<IEnumerable<ChatOutDTO>>> GetFreeChats(Guid userId)
    {
        var chats = await chatsRepository.GetFreeChats();

        return Result.Ok(mapper.MapChats(chats, userId));
    }

    public async Task<Result<IEnumerable<ChatOutDTO>>> GetChatsByUser(Guid userId)
    {
        var chats = await chatsRepository.GetAllByUser(userId);

        return Result.Ok(mapper.MapChats(chats, userId));
    }

    public async Task<Result<ChatOutDTO>> GetChatByIdAsync(Guid userId, Guid chatId)
    {
        var chat = await chatsRepository.GetByIdAsync(chatId);
        return chat == null
            ? Result.NotFound<ChatOutDTO>("Чат с таким Id не найден")
            : Result.Ok(mapper.MapChat(chat, userId));
    }

    public async Task<Result<bool>> ChangeChatStatus(Guid chatId, ChangeChatStatusRequest req)
    {
        var chat = await chatsRepository.GetByIdAsync(chatId);
        if (chat == null)
            return Result.NotFound<bool>("");
        if (chat.Status == req.Status)
            return Result.NoContent<bool>();

        chat.Status = req.Status;
        await chatsRepository.UpdateAsync(chat);
        await log.Info($"chat: {chat.Id} was archived");
        if (req.Status == ChatStatus.Archived)
        {
            foreach (var receiver in chat.Profiles)
            {
                await SendSystemMessage(chat.Id, "Чат архивирован менеджером");
            }
        }
        return Result.NoContent<bool>();
    }

    /// <summary>
    /// Изменить чат.
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    public async Task<Result<CreateResponse>> ChangeChat(ChangeChatRequest request)
    {
        var chat = await chatsRepository.GetByIdAsync(request.ChatId);
        if (chat == null)
            return Result.NotFound<CreateResponse>("");

        if (request.Status != null)
            chat.Status = request.Status.Value;
        if (request.ClientId != null)
        {
            var client = request.ClientId == Guid.Empty 
                ? null 
                : await clientsRepository.GetByIdAsync(request.ClientId.Value);
            if (client == null && request.ClientId != Guid.Empty)
                return Result.BadRequest<CreateResponse>("Клиента, которого вы хотите привязать не существует");

            chat.Client = client;
        }

        await chatsRepository.SaveChangesAsync();
        return Result.Ok(new CreateResponse
        {
            Id = chat.Id,
            IsCreated = false,
        });
    }

    public Result<SearchResponseBaseDTO<MessageOutDTO>> SearchMessages(Guid chatId,
        Guid userId,
        MessagesSearchRequest messagesSearchReq)
    {
        var result = messagesRepository.Search(chatId, messagesSearchReq);
        return Result.Ok(new SearchResponseBaseDTO<MessageOutDTO>
        {
            Items = mapper.MapMessages(result.Items, userId),
            TotalCount = result.TotalCount,
        });
    }

    private static long chatsCounter = 0;
    public async Task<ChatEntity?> CreateChatWithUsers(Guid[] userIds)
    {
        var users = await profilesRepository.GetByIdsAsync(userIds);
        if (users.Count != userIds.Length)
            return null;

        var chat = new ChatEntity
        {
            Name = $"№{chatsCounter++}",
            Profiles = users.ToHashSet(),
        };
        await chatsRepository.CreateAsync(chat);

        await log.Info($"Chat(Id: {chat.Id} Name: {chat.Name}) created with users(Ids): {userIds.LogExpression()}");
        return chat;
    }

    public async Task<Result<ChatEntity>> GetOrCreateChatWithUsers(Guid[] userIds)
    {
        var chat = await chatsRepository.GetByUsers(userIds.ToHashSet());
        if (chat != null)
            return Result.Ok(chat);

        chat = await CreateChatWithUsers(userIds);
        if (chat == null)
            return Result.BadRequest<ChatEntity>("Некорректные пользователи, неудалось создать чат");
        await chatHub.Clients.Group("Managers").SendAsync("UpdateFreeChats");

        return Result.Ok(chat);
    }
}