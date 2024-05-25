using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.Comments;
using API.Modules.CrmModule.Comments.DTO;
using API.Modules.CrmModule.Comments.Requests;
using API.Modules.CrmModule.Taskcolumns;
using API.Modules.CrmModule.Taskcolumns.DTO;
using API.Modules.CrmModule.Taskcolumns.Requests;
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
    Task<Result<SearchResponseBaseDTO<TaskCommentDTO>>> Search(Guid taskId, SearchTaskCommentsRequest request);
    Task<Result<bool>> DeleteTaskComment(Guid taskId, Guid commentId);
    
    Task<Result<SearchResponseBaseDTO<TaskColumnDTO>>> SearchTaskColumns(SearchTaskColumnsRequest request);
    Task<Result<CreateResponse>> CreateOrUpdateTaskColumn(CreateOrUpdateTaskColumnRequest request);
    Task<Result<bool>> DeleteTaskColumn(Guid columnId);
}

public class CrmService : ICrmService
{
    private readonly ITasksService tasksService;
    private readonly ITasksCommentsService commentsService;
    private readonly ITasksColumnsService columnsService;

    public CrmService(ITasksService tasksService, ITasksCommentsService commentsService, ITasksColumnsService columnsService)
    {
        this.tasksService = tasksService;
        this.commentsService = commentsService;
        this.columnsService = columnsService;
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

    public async Task<Result<SearchResponseBaseDTO<TaskCommentDTO>>> Search(Guid taskId, SearchTaskCommentsRequest request)
        => await commentsService.Search(taskId, request);

    public async Task<Result<bool>> DeleteTaskComment(Guid taskId, Guid commentId)
        => await commentsService.DeleteTaskComment(taskId, commentId);

    public async Task<Result<SearchResponseBaseDTO<TaskColumnDTO>>> SearchTaskColumns(SearchTaskColumnsRequest request)
        => await columnsService.Search(request);

    public async Task<Result<CreateResponse>> CreateOrUpdateTaskColumn(CreateOrUpdateTaskColumnRequest request)
        => await columnsService.CreateOrUpdate(request);

    public async Task<Result<bool>> DeleteTaskColumn(Guid columnId)
        => await columnsService.Delete(columnId);
}