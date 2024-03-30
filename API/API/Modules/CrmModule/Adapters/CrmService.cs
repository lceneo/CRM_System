using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.DTO;
using API.Modules.CrmModule.Models;
using API.Modules.CrmModule.Ports;

namespace API.Modules.CrmModule.Adapters;

public class CrmService : ICrmService
{
    private readonly ITasksService tasksService;

    public CrmService(ITasksService tasksService)
    {
        this.tasksService = tasksService;
    }

    public async Task<Result<CreateResponse<Guid>>> CreateOrUpdateTask(CreateOrUpdateTaskRequest request, Guid initiatedBy)
        => await tasksService.CreateOrUpdateTask(request, initiatedBy);
    
    public async Task<Result<SearchResponseBaseDTO<TaskDTO>>> Search(SearchTasksRequest request)
        => await tasksService.Search(request);
}