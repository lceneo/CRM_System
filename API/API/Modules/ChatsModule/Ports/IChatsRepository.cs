using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.Ports;

public interface IChatsRepository : ICRURepository<ChatEntity>
{
    Task<List<ChatEntity>> GetFreeChats();
    Task<List<ChatEntity>> GetAllByUser(Guid userId);
    Task<ChatEntity?> GetByUsers(HashSet<Guid> userIds);
    Task<SearchResponseBaseDTO<ChatEntity>> SearchChatsAsync(ChatsSearchRequest req, bool asNoTracking = false);
}