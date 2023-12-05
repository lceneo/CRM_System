using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.Ports;

public interface IChatsService
{
    Task<Result<(ChatEntity chat, MessageEntity message)>> SendMessageAsync(
        Guid recipientId,
        Guid senderId,
        string message);

    Task<Result<IEnumerable<ChatOutDTO>>> GetChatsByUser(Guid userId);

    Task<Result<ChatOutDTO>> GetChatByIdAsync(Guid userId, Guid chatId);

    Result<SearchResponseBaseDTO<MessageInChatDTO>> SearchMessages(Guid chatId, MessagesSearchRequest messagesSearchReq);
    
    Task<ChatEntity?> CreateChatWithUsers(Guid[] userIds);

    Task<ChatEntity?> GetOrCreateChatWithUsers(Guid[] userIds);
}