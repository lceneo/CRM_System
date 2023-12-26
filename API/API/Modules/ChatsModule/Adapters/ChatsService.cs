using API.Extensions;
using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using API.Modules.ChatsModule.Ports;
using API.Modules.LogsModule;
using API.Modules.ProfilesModule.DTO;
using API.Modules.ProfilesModule.Ports;
using AutoMapper;
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

    public ChatsService(
        ILog log,
        IMapper mapper,
        IChatsRepository chatsRepository,
        IProfilesRepository profilesRepository,
        IMessagesRepository messagesRepository,
        IHubContext<ChatsHub> chatHub)
    {
        this.log = log;
        this.chatsRepository = chatsRepository;
        this.profilesRepository = profilesRepository;
        this.messagesRepository = messagesRepository;
        this.mapper = mapper;
        this.chatHub = chatHub;
    }

    public async Task<Result<(ChatEntity chat, MessageEntity message)>> SendMessageAsync(
        Guid recipientId,
        Guid senderId,
        string message)
    {
        var lazyUsers = new Lazy<Guid[]>(() => new[] {recipientId, senderId});
        var chat = await chatsRepository.GetByIdAsync(recipientId)
                   ?? await chatsRepository.GetByUsers(new HashSet<Guid>(lazyUsers.Value))
                   ?? await CreateChatWithUsers(lazyUsers.Value);
        if (chat == null)
            return Result.NotFound<(ChatEntity chat, MessageEntity message)>("Неправильный идентификатор чата/пользователя");
        if (chat.Status == ChatStatus.Blocked)
            return Result.BadRequest<(ChatEntity chat, MessageEntity message)>("Чат заблокирован сервисом");
        
        if (chat.Status == ChatStatus.Archived)
        {
            chat.Status = ChatStatus.Active;
            await chatsRepository.UpdateAsync(chat);
            await log.Info($"Chat(Id: {chat.Id}) was Unarchived (Archived -> Active)");
        }
        var messageEntity = new MessageEntity
        {
            Message = message,
            Type = MessageType.Text,
            Chat = chat,
            Sender = chat.Profiles.First(p => p.Id == senderId),
            DateTime = DateTime.Now,
        };
        await messagesRepository.CreateAsync(messageEntity);

        await LogMessage(messageEntity, chat.Id);
        return Result.Ok((chat, messageEntity));
    }

    public async Task<Result<SearchResponseBaseDTO<ChatOutDTO>>> SearchChats(Guid userId, ChatsSearchRequest req)
    {
        var searchResp = await chatsRepository.SearchChatsAsync(req);
        return Result.Ok(new SearchResponseBaseDTO<ChatOutDTO>
        {
            TotalCount = searchResp.TotalCount,
            Items = searchResp.Items
                .Select(c => mapper.Map<ChatOutDTO>(c, 
                    opt => opt.Items["userId"] = userId))
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
            await chatHub.Clients.Group(receiver.Id.ToString()).SendAsync("Recieve", mapper.Map<MessageOutDTO>(messageEntity));

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

    public async Task<Result<IEnumerable<ChatOutDTO>>> GetFreeChats()
    {
        var chats = await chatsRepository.GetFreeChats();

        return Result.Ok(mapper.Map<IEnumerable<ChatOutDTO>>(chats));
    }

    public async Task<Result<IEnumerable<ChatOutDTO>>> GetChatsByUser(Guid userId)
    {
        var chats = await chatsRepository.GetAllByUser(userId);

        return Result.Ok(mapper.Map<IEnumerable<ChatOutDTO>>(chats, opt => opt.Items["userId"] = userId));
    }

    public async Task<Result<ChatOutDTO>> GetChatByIdAsync(Guid userId, Guid chatId)
    {
        var chat = await chatsRepository.GetByIdAsync(chatId);
        return chat == null
            ? Result.NotFound<ChatOutDTO>("Чат с таким Id не найден")
            : Result.Ok(mapper.Map<ChatOutDTO>(chat, opt => opt.Items["userId"] = userId));
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
        return Result.NoContent<bool>();
    }

    public Result<SearchResponseBaseDTO<MessageInChatDTO>> SearchMessages(Guid chatId,
        MessagesSearchRequest messagesSearchReq)
    {
        var result = messagesRepository.SearchAsync(chatId, messagesSearchReq);
        return Result.Ok(new SearchResponseBaseDTO<MessageInChatDTO>
        {
            Items = mapper.Map<List<MessageInChatDTO>>(result.Items),
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