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
    /// Создаёт/Редактирует задачу.
    /// </summary>
    /// <remarks>
    /// Если передан `Id` - пытается редактировать существующее
    /// Если нет - создаёт новую
    ///
    /// Редактирование - копирует все поля из запроса, если они не `null`
    /// 
    /// `AssignedTo` - на кого назначена задача.
    /// Чтобы убрать назначенного нужно передать Guid.Empty (00000000-0000-0000-0000-000000000000)
    /// 
    /// `State` - Состояние задачи, enum.
    /// Значения:
    ///  {
    ///     New,
    ///     Pause,
    ///     InProgress,
    ///     Done,
    ///    Archived,
    /// }
    /// 
    /// </remarks>
    /// <returns></returns>
    [HttpPost("Tasks")]
    public async Task<ActionResult<CreateResponse<Guid>>> CreateOrUpdateTask([FromBody]CreateOrUpdateTaskRequest request)
    {
        var result = await crmService.CreateOrUpdateTask(request, User.GetId());
        return result.ActionResult;
    }

    /// <summary>
    /// Поиск по задачам
    /// </summary>
    /// <remarks>
    /// Creation - инфа о создании
    /// LastEdition - инфа о последнем редактировании
    /// </remarks>
    /// <returns></returns>
    [HttpPost("Tasks/Search")]
    public async Task<ActionResult<SearchResponseBaseDTO<TaskDTO>>> SearchTasks([FromBody]SearchTasksRequest request)
    {
        var result = await crmService.SearchTasks(request);
        return result.ActionResult;
    }

    /// <summary>
    /// Удаляет задачу
    /// </summary>
    /// <returns></returns>
    [HttpDelete("Tasks/{taskId:Guid}")]
    public async Task<ActionResult> DeleteTask([FromRoute]Guid taskId)
    {
        await crmService.DeleteTask(taskId);
        return NoContent();
    }
}