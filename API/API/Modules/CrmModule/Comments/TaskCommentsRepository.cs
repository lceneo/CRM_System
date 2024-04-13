using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.Comments.Requests;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.CrmModule.Comments;

public interface ITaskCommentsRepository : ICRUDRepository<TaskCommentEntity>
{
    Task<SearchResponseBaseDTO<TaskCommentEntity>> Search(
        SearchTaskCommentsRequest request,
        bool asNoTracking = false);
}

public class TaskCommentsRepository : CRUDRepository<TaskCommentEntity>, ITaskCommentsRepository
{
    public TaskCommentsRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    private IQueryable<TaskCommentEntity> IncludedSet => Set
        .Include(e => e.Task)
        .Include(e => e.Author)
        .AsQueryable();

    public async Task<TaskCommentEntity?> GetByIdAsync(Guid taskId)
    {
        return await IncludedSet
            .FirstOrDefaultAsync(e => e.Id == taskId);
    }
    
    public async Task<CreateResponse<Guid>> CreateOrUpdateAsync(TaskCommentEntity entity)
        => await base.CreateOrUpdateAsync(entity, IncludedSet);

    public async Task<SearchResponseBaseDTO<TaskCommentEntity>> Search(
        SearchTaskCommentsRequest request,
        bool asNoTracking = false)
    {
        var query = IncludedSet;
        if (asNoTracking)
            query = query.AsNoTracking();

        if (request.Ids != null)
            query = query.Where(e => request.Ids.Contains(e.Id));
        if (request.TaskId != null)
            query = query.Where(e => e.Task.Id == request.AuthorId);
        if (request.AuthorId != null)
            query = query.Where(e => e.Author.Id == request.AuthorId);
        if (request.Text != null)
            query = query.Where(e => e.Text.Contains(request.Text));

        query = query.OrderBy(e => e.CreatedAt);

        var result = await query.ToListAsync();
        return new SearchResponseBaseDTO<TaskCommentEntity>
        {
            TotalCount = result.Count,
            Items = result,
        };
    }
}