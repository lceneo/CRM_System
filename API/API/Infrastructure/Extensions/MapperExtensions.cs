using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using AutoMapper;

namespace API.Infrastructure.Extensions;

public static class MapperExtensions
{
    public static MessageOutDTO MapMessage(this IMapper mapper, MessageEntity message, Guid userId)
    {
        return mapper.Map<MessageOutDTO>(message, opt => opt.Items["userId"] = userId);
    }
    
    public static List<MessageOutDTO> MapMessages(this IMapper mapper, IEnumerable<MessageEntity> messages, Guid userId)
    {
        return mapper.Map<List<MessageOutDTO>>(messages, opt => opt.Items["userId"] = userId);
    }
    
    public static ChatOutDTO MapChat(this IMapper mapper, ChatEntity chat, Guid userId)
    {
        return mapper.Map<ChatOutDTO>(chat, opt => opt.Items["userId"] = userId);
    }

    public static IEnumerable<ChatOutDTO> MapChats(this IMapper mapper, IEnumerable<ChatEntity> chats, Guid userId)
    {
        return mapper.Map<IEnumerable<ChatOutDTO>>(chats, opt => opt.Items["userId"] = userId);
    }
}