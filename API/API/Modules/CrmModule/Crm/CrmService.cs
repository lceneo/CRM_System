using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.Comments;
using API.Modules.CrmModule.Comments.DTO;
using API.Modules.CrmModule.Comments.Requests;
using API.Modules.CrmModule.Tasks;
using API.Modules.CrmModule.Tasks.DTO;
using API.Modules.CrmModule.Tasks.Requests;

namespace API.Modules.CrmModule.Crm;

public interface ICrmService
{
    Task<Result<CreateResponse<Guid>>> CreateOrUpdateTask(CreateOrUpdateTaskRequest request, Guid userId);
    Task<Result<SearchResponseBaseDTO<TaskDTO>>> SearchTasks(SearchTasksRequest request);
    Task<Result<bool>> DeleteTask(Guid taskId);
    
    Task<Result<CreateResponse<Guid>>> CreateOrUpdateTaskComment(Guid taskId, CreateOrUpdateTaskCommentRequest request, Guid userId);
    Task<Result<SearchResponseBaseDTO<TaskCommentDTO>>> Search(SearchTaskCommentsRequest request);
    Task<Result<bool>> DeleteTaskComment(Guid taskId, Guid commentId);
}

public class CrmService : ICrmService
{
    private readonly ITasksService tasksService;
    private readonly ITasksCommentsService commentsService;

    public CrmService(ITasksService tasksService, ITasksCommentsService commentsService)
    {
        this.tasksService = tasksService;
        this.commentsService = commentsService;
    }

    public async Task<Result<CreateResponse<Guid>>> CreateOrUpdateTask(CreateOrUpdateTaskRequest request, Guid userId)
        => await tasksService.CreateOrUpdateTask(request, userId);
    
    public async Task<Result<SearchResponseBaseDTO<TaskDTO>>> SearchTasks(SearchTasksRequest request)
        => await tasksService.SearchTasks(request);

    public async Task<Result<bool>> DeleteTask(Guid taskId)
        => await tasksService.DeleteTask(taskId);

    public async Task<Result<CreateResponse<Guid>>> CreateOrUpdateTaskComment(
        Guid taskId,
        CreateOrUpdateTaskCommentRequest request,
        Guid userId)
            => await commentsService.CreateOrUpdateTaskComment(taskId, request, userId);

    public async Task<Result<SearchResponseBaseDTO<TaskCommentDTO>>> Search(SearchTaskCommentsRequest request)
        => await commentsService.Search(request);

    public async Task<Result<bool>> DeleteTaskComment(Guid taskId, Guid commentId)
        => await commentsService.DeleteTaskComment(taskId, commentId);
}