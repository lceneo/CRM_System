using API.DAL.Repository;
using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.Ports;

public interface IChatsRepository : ICRURepository<ChatEntity>
{
    Task<List<ChatEntity>> GetAllByUser(Guid userId);
}