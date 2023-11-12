using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ProfilesModule.ApiDTO;
using API.Modules.ProfilesModule.Entities;
using API.Modules.ProfilesModule.Ports;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.ProfilesModule.Adapters;

public class ProfilesRepository : CRURepository<ProfileEntity>,
    IProfilesRepository
{
    public ProfilesRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    public Task<ProfileEntity?> GetByIdAsync(Guid id)
    {
        return Set
            .Include(p => p.Account)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public SearchResponseBaseDTO<ProfileEntity> Search(ProfilesSearchRequest searchReq)
    {
        var query = Set
            .Include(p => p.Account)
            .AsQueryable();
        if (searchReq.Ids != null)
            query = query.Where(p => searchReq.Ids.Contains(p.Id));
        if (searchReq.Role != null)
            query = query.Where(p => p.Account.Role == searchReq.Role);

        var totalCount = query.Count();
        var items = query
            .Skip(searchReq.Skip)
            .Take(searchReq.Take)
            .ToList();

        return new SearchResponseBaseDTO<ProfileEntity>
        {
            TotalCount = totalCount,
            Items = items,
        };
    }
}