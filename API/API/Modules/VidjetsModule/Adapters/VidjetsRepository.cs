using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.VidjetsModule.Entities;
using API.Modules.VidjetsModule.Models;
using API.Modules.VidjetsModule.Ports;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.VidjetsModule.Adapters;

public class VidjetsRepository : CRUDRepository<VidjetEntity>, IVidjetsRepository
{
    public VidjetsRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }


    public async Task<SearchResponseBaseDTO<VidjetEntity>> SearchVidjetsAsync(
        VidjetsSearchRequest searchReq,
        bool asTracking = false)
    {
        var query = Set
            .Include(e => e.Account)
            .AsQueryable();

        if (!asTracking)
            query = query.AsNoTracking();
        if (searchReq.UserIds != null)
            query = query.Where(v => searchReq.UserIds.Contains(v.Account.Id));
        if (searchReq.Ids != null)
            query = query.Where(v => searchReq.Ids.Contains(v.Id));
        if (searchReq.Domen != null)
            query = query.Where(v => v.Domen.Contains(searchReq.Domen));

        var total = query.Count();
        return new SearchResponseBaseDTO<VidjetEntity>
        {
            TotalCount = total,
            Items = await query
                .Skip(searchReq.Skip > total ? total : searchReq.Skip)
                .Take(searchReq.Take)
                .ToListAsync(),
        };
    }
}