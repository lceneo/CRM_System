using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.DTO;
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

    private IQueryable<ChatEntity> IncludedSet => Set
        .Include(c => c.Profiles).ThenInclude(p => p.Account)
        .Include(c => c.Messages).ThenInclude(m => m.Sender)
        .Include(c => c.Messages).ThenInclude(m => m.Files)
        .Include(c => c.Messages).ThenInclude(m => m.Checks).ThenInclude(c => c.Profile)
        .AsQueryable();

    public async Task<List<ChatEntity>> GetFreeChats()
    {
        return await IncludedSet
            .AsNoTracking()
            .Where(c => c.Profiles.Count == 1)
            .ToListAsync();
    }

    public async Task<ChatEntity?> GetByIdAsync(Guid id)
    {
        return await IncludedSet
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<ChatEntity>> GetAllByUser(Guid userId)
    {
        return await IncludedSet
            .Where(c => c.Profiles.Any(p => p.Id == userId))
            .ToListAsync();
    }

    public async Task<ChatEntity?> GetByUsers(HashSet<Guid> userIds)
    {
        return await IncludedSet
            .FirstOrDefaultAsync(c => c.Profiles.Count == userIds.Count
                                      && c.Profiles.All(p => userIds.Contains(p.Id)));
    }

    public async Task<SearchResponseBaseDTO<ChatEntity>> SearchChatsAsync(ChatsSearchRequest req, bool asNoTracking = false)
    {
        var query = IncludedSet;
        
        if (asNoTracking)
            query = query.AsNoTracking();
        if (req.Ids?.Any() is true)
            query = query.Where(c => req.Ids.Contains(c.Id));
        if (req.ChatStatus != null)
            query = query.Where(c => c.Status == req.ChatStatus);
        if (req.ChatName != null)
            query = query.Where(c => c.Name.Contains(req.ChatName));
        if (req.UserIds?.Any() is true)
            query = query.Where(c => c.Profiles.All(p => req.UserIds.Contains(p.Id)));

        var total = query.Count();
        var items = await query
            .Skip(req.Skip)
            .Take(req.Take)
            .ToListAsync();
        return new SearchResponseBaseDTO<ChatEntity>
        {
            TotalCount = total,
            Items = items,
        };
    }
}