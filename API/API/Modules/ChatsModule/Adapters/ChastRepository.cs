using API.DAL;
using API.DAL.Repository;
using API.Modules.ChatsModule.Entities;
using API.Modules.ChatsModule.Ports;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.ChatsModule.Adapters;

public class ChatsRepository : CRURepository<ChatEntity>, IChatsRepository
{
    public ChatsRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    public async Task<ChatEntity?> GetByIdAsync(Guid id)
    {
        return await Set
            .Include(c => c.Profiles)
                .ThenInclude(p => p.Account)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<ChatEntity>> GetAllByUser(Guid userId)
    {
        return await Set
            .Include(c => c.Profiles)
                .ThenInclude(p => p.Account)
            .Include(c => c.Messages)
            .Where(c => c.Profiles.Any(p => p.Id == userId))
            .ToListAsync();
    }
}