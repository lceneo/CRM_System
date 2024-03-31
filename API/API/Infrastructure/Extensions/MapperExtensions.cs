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
}