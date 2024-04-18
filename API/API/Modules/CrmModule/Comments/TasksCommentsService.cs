using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.Comments.DTO;
using API.Modules.CrmModule.Comments.Requests;
using API.Modules.CrmModule.Tasks;
using API.Modules.LogsModule;
using API.Modules.ProfilesModule.Ports;
using AutoMapper;

namespace API.Modules.CrmModule.Comments;

public interface ITasksCommentsService
{
    Task<Result<CreateResponse<Guid>>> CreateOrUpdateTaskComment(Guid taskId, CreateOrUpdateTaskCommentRequest request,
        Guid userId);

    Task<Result<SearchResponseBaseDTO<TaskCommentDTO>>> Search(Guid taskId, SearchTaskCommentsRequest request);

    Task<Result<bool>> DeleteTaskComment(Guid taskId, Guid commentId);
}

public class TasksCommentsService : ITasksCommentsService
{
    private readonly ILog log;
    private readonly IMapper mapper;
    private readonly IProfilesRepository profilesRepository;
    private readonly ITasksRepository tasksRepository;
    private readonly ITaskCommentsRepository commentsRepository;

    public TasksCommentsService(ILog log, IMapper mapper, IProfilesRepository profilesRepository, ITasksRepository tasksRepository, ITaskCommentsRepository commentsRepository)
    {
        this.log = log;
        this.mapper = mapper;
        this.profilesRepository = profilesRepository;
        this.tasksRepository = tasksRepository;
        this.commentsRepository = commentsRepository;
    }

    public async Task<Result<CreateResponse<Guid>>> CreateOrUpdateTaskComment(
        Guid taskId,
        CreateOrUpdateTaskCommentRequest request,
        Guid userId)
    {
        var user = await profilesRepository.GetByIdAsync(userId);
        if (user == null)
            return Result.NotFound<CreateResponse<Guid>>("Такого пользователя не существует");
        var task = await tasksRepository.GetByIdAsync(taskId);
        if (task == null)
            return Result.NotFound<CreateResponse<Guid>>("Такой задачи не существует");
        

        TaskCommentEntity? comment = null;
        if (request.Id != null)
        {
            comment = await commentsRepository.GetByIdAsync(request.Id.Value);
            if (comment == null)
                return Result.NotFound<CreateResponse<Guid>>("Такой задачи не существует");
            if (comment.Author.Id != userId)
                return Result.BadRequest<CreateResponse<Guid>>("Нет прав");
            if (comment.Task.Id != taskId)
                return Result.BadRequest<CreateResponse<Guid>>("Комментарий прикреплён к другой задаче");
            comment.LastEditedAt = DateTime.Now;
            mapper.Map(request, comment);
            await commentsRepository.SaveChangesAsync();
            await log.Info($"POST TaskComment isCreated: {false} comment: {request.Id.Value}");
            return Result.Ok(new CreateResponse<Guid>() {IsCreated = false, Id = request.Id.Value});
        }
        else
        {
            comment = new TaskCommentEntity
            {
                Author = user,
                Task = task,
                CreatedAt = DateTime.Now,
            };
        }

        mapper.Map(request, comment);
        var result = await commentsRepository.CreateOrUpdateAsync(comment);
        await log.Info($"POST TaskComment isCreated: {result.IsCreated} comment: {result.Id}");
        return Result.Ok(result);
    }

    public async Task<Result<SearchResponseBaseDTO<TaskCommentDTO>>> Search(Guid taskId, SearchTaskCommentsRequest request)
    {
        var result = await commentsRepository.Search(taskId, request, true);
        return Result.Ok(new SearchResponseBaseDTO<TaskCommentDTO>
        {
            Items = mapper.Map<List<TaskCommentDTO>>(result.Items),
            TotalCount = result.TotalCount,
        });
    }

    public async Task<Result<bool>> DeleteTaskComment(Guid taskId, Guid commentId)
    {
        await commentsRepository.DeleteAsync(commentId);
        return Result.Ok(true);
    }
}