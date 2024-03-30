using API.Extensions;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.DTO;
using API.Modules.CrmModule.Models;
using API.Modules.CrmModule.Ports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.CrmModule;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CrmController : ControllerBase
{
    private readonly ICrmService crmService;

    public CrmController(ICrmService crmService)
    {
        this.crmService = crmService;
    }

    /// <summary>
    /// Создаёт/Редактирует задачу
    /// </summary>
    /// <returns></returns>
    [HttpPost("Tasks")]
    public async Task<ActionResult<CreateResponse<Guid>>> CreateOrUpdateTask([FromBody]CreateOrUpdateTaskRequest request)
    {
        var result = await crmService.CreateOrUpdateTask(request, User.GetId());
        return result.ActionResult;
    }

    [HttpPost("Tasks/Search")]
    public async Task<ActionResult<SearchResponseBaseDTO<TaskDTO>>> SearchTasks([FromBody]SearchTasksRequest request)
    {
        var result = await crmService.Search(request);
        return result.ActionResult;
    }
}