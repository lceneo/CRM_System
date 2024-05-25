using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.Taskcolumns.Entities;
using API.Modules.CrmModule.Taskcolumns.Requests;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.CrmModule.Taskcolumns;

public interface ITaskColumnsRepository : ICRUDRepository<TaskColumnEntity>
{
    Task<SearchResponseBaseDTO<TaskColumnEntity>> Search(SearchTaskColumnsRequest request);
}

public class TaskColumnsRepository : CRUDRepository<TaskColumnEntity>, ITaskColumnsRepository
{
    public TaskColumnsRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    private IQueryable<TaskColumnEntity> IncludedSet => Set
        .Include(e => e.Tasks)
        .AsQueryable();

    public async Task<SearchResponseBaseDTO<TaskColumnEntity>> Search(SearchTaskColumnsRequest request)
    {
        var query = IncludedSet;

        if (request.Ids != null)
            query = query.Where(e => request.Ids.Contains(e.Id));
        if (request.Name != null)
            query = query.Where(e => e.Name.Contains(e.Name));
        if (request.Order != null)
            query = query.Where(e => e.Order == request.Order);
        
        return new SearchResponseBaseDTO<TaskColumnEntity>
        {
            TotalCount = query.Count(),
            Items = await query
                .Skip(request.Skip)
                .Take(request.Take)
                .OrderBy(c => c.Order)
                .ToListAsync()
        };
    }
}