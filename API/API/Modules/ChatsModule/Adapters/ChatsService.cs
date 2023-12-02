﻿using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using API.Modules.ChatsModule.Ports;
using API.Modules.ProfilesModule.Ports;
using AutoMapper;

namespace API.Modules.ChatsModule.Adapters;

public class ChatsService : IChatsService
{
    private readonly IChatsRepository chatsRepository;
    private readonly IMessagesRepository messagesRepository;
    private readonly IProfilesRepository profilesRepository;
    private readonly IMapper mapper;

    public ChatsService(IChatsRepository chatsRepository,
        IProfilesRepository profilesRepository,
        IMessagesRepository messagesRepository,
        IMapper mapper)
    {
        this.chatsRepository = chatsRepository;
        this.profilesRepository = profilesRepository;
        this.messagesRepository = messagesRepository;
        this.mapper = mapper;
    }

    public async Task<Result<(ChatEntity chat, MessageEntity message)>> SendMessageAsync(
        Guid recipientId, 
        Guid senderId, 
        string message)
    {
        var chat = await chatsRepository.GetByIdAsync(recipientId) 
                   ?? await CreateChatWithUsers(new[] {recipientId, senderId});
        if (chat == null)
            return Result.NotFound<(ChatEntity chat, MessageEntity message)>("Неправильный идентификатор чата/пользователя");

        var messageEntity = new MessageEntity
        {
            Message = message,
            Chat = chat,
            Sender = chat.Profiles.First(p => p.Id == senderId),
            DateTime = DateTime.Now,
        };
        await messagesRepository.CreateAsync(messageEntity);

        return Result.Ok((chat, messageEntity));
    }

    public async Task<Result<IEnumerable<ChatOutDTO>>> GetChatsByUser(Guid userId)
    {
        var chats = await chatsRepository.GetAllByUser(userId);
        
        return Result.Ok(mapper.Map<IEnumerable<ChatOutDTO>>(chats, opt => opt.Items["userId"] = userId));
    }

    public async Task<Result<ChatOutDTO>> GetChatByIdAsync(Guid chatId)
    {
        var chat = await chatsRepository.GetByIdAsync(chatId);
        return chat == null
            ? Result.NotFound<ChatOutDTO>("Чат с таким Id не найден")
            : Result.Ok(mapper.Map<ChatOutDTO>(chat));
    }

    public Result<SearchResponseBaseDTO<MessageInChatDTO>> SearchMessages(Guid chatId, MessagesSearchRequest messagesSearchReq)
    {
        var result = messagesRepository.SearchAsync(chatId, messagesSearchReq);
        return Result.Ok(new SearchResponseBaseDTO<MessageInChatDTO>
        {
            Items = mapper.Map<List<MessageInChatDTO>>(result.Items),
            TotalCount = result.TotalCount,
        });
    }

    private static long chatsCounter = 0;
    private async Task<ChatEntity?> CreateChatWithUsers(Guid[] userIds)
    {
        var users = await profilesRepository.GetByIdsAsync(userIds);
        if (users.Count() != userIds.Length)
            return null;

        var chat = new ChatEntity
        {
            Name = $"№{chatsCounter++}",
            Profiles = users.ToHashSet(),
        };
        await chatsRepository.CreateAsync(chat);
        return chat;
    }
}