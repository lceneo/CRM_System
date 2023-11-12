using API.Infrastructure;
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
}