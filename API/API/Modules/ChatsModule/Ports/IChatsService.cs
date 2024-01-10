using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using API.Modules.ProfilesModule.DTO;

namespace API.Modules.ChatsModule.Ports;

public interface IChatsService
{
    Task<Result<(ChatEntity chat, MessageEntity message)>> SendMessageAsync(
        Guid senderId,
        SendMessageRequest request);

    Task<Result<SearchResponseBaseDTO<ChatOutDTO>>> SearchChats(Guid userId, ChatsSearchRequest req);

    Task<Result<IEnumerable<ProfileOutDTO>>> JoinChatAsync(Guid chatId, Guid userId);
    Task<Result<bool>> LeaveChatAsync(Guid chatId, Guid userId);

    Task<Result<IEnumerable<ChatOutDTO>>> GetFreeChats();

    Task<Result<IEnumerable<ChatOutDTO>>> GetChatsByUser(Guid userId);

    Task<Result<ChatOutDTO>> GetChatByIdAsync(Guid userId, Guid chatId);
    
    Task<Result<bool>> ChangeChatStatus(Guid chatId, ChangeChatStatusRequest req);

    Result<SearchResponseBaseDTO<MessageOutDTO>> SearchMessages(Guid chatId, Guid userId, MessagesSearchRequest messagesSearchReq);

    Task<ChatEntity?> CreateChatWithUsers(Guid[] userIds);

    Task<Result<ChatEntity>> GetOrCreateChatWithUsers(Guid[] userIds);
}