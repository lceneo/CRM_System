using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.DTO;
using API.Modules.CrmModule.Models;

namespace API.Modules.CrmModule.Ports;

public interface ITasksService
{
    Task<Result<CreateResponse<Guid>>> CreateOrUpdateTask(CreateOrUpdateTaskRequest request, Guid initiatedBy);
    Task<Result<SearchResponseBaseDTO<TaskDTO>>> SearchTasks(SearchTasksRequest request);
    Task<Result<bool>> DeleteTask(Guid taskId);
}