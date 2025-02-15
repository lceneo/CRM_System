﻿using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.Tasks.Entities;
using API.Modules.CrmModule.Tasks.Requests;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.CrmModule.Tasks;

public interface ITasksRepository : ICRUDRepository<TaskEntity>
{
    public Task<SearchResponseBaseDTO<TaskEntity>> Search(SearchTasksRequest request, bool asNoTracking = false);
}

public class TasksRepository : CRUDRepository<TaskEntity>, ITasksRepository
{
    public TasksRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }
    
    private IQueryable<TaskEntity> IncludedSet => Set
        .Include(e => e.AssignedTo)
        .Include(e => e.Actions).ThenInclude(a => a.User)
        .Include(e => e.Comments).ThenInclude(c => c.Author)
        .Include(e => e.Products)
        .Include(e => e.Client)
        .Include(e => e.Column)
        .AsQueryable();

    public async Task<TaskEntity?> GetByIdAsync(Guid taskId)
    {
        return await IncludedSet
            .FirstOrDefaultAsync(e => e.Id == taskId);
    }

    public async Task<SearchResponseBaseDTO<TaskEntity>> Search(SearchTasksRequest request, bool asNoTracking = false)
    {
        var query = IncludedSet;
        if (asNoTracking)
            query = query.AsNoTracking();

        if (request.Ids != null)
            query = query.Where(e => request.Ids.Contains(e.Id));
        if (request.AssignedTo != null)
            query = query.Where(e => e.AssignedTo != null && e.AssignedTo.Id == request.AssignedTo);
        if (request.ColumnId != null)
            query = query.Where(e => e.Column != null && e.Column.Id == request.ColumnId);
        if (request.Title != null)
            query = query.Where(e => e.Title.Contains(request.Title));
        if (request.ClientId != null)
            query = query.Where(e => e.Client != null && e.Client.Id == request.ClientId);

        var items = await query.ToListAsync();
        return new SearchResponseBaseDTO<TaskEntity>
        {
            Items = items,
            TotalCount = items.Count,
        };
    }
}