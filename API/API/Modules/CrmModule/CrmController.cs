using API.Extensions;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.Comments.DTO;
using API.Modules.CrmModule.Comments.Requests;
using API.Modules.CrmModule.Crm;
using API.Modules.CrmModule.Tasks.DTO;
using API.Modules.CrmModule.Tasks.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.CrmModule;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CrmController : ControllerBase
{
    private readonly ICrmService crmService;
    private readonly ICrmHubNotifier hub;

    public CrmController(ICrmService crmService, ICrmHubNotifier hub)
    {
        this.crmService = crmService;
        this.hub = hub;
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
        if (result.IsSuccess)
            await hub.NotifyChanges(result.Value.Id);
        return result.ActionResult;
    }

    /// <summary>
    /// Поиск по задачам
    /// </summary>
    /// <remarks>
    /// <para>`Creation` - инфа о создании</para>
    /// <para>`LastEdition` - инфа о последнем редактировании</para>
    /// <para>Комментарии отсортированы по дате</para>
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
        await hub.NotifyChanges();
        return NoContent();
    }


    /// <summary>
    /// Добавить/изменить коммент у задачи. 
    /// </summary>
    /// <remarks>
    /// Описание полей в модельке(снизу)
    /// 
    /// Название модели запроса - <see cref="CreateOrUpdateTaskCommentRequest"/>
    /// </remarks>
    /// <returns></returns>
    [HttpPost("Tasks/{taskId:Guid}/Comments")]
    public async Task<ActionResult<CreateResponse<Guid>>> CreateOrUpdateTaskComment(
        [FromRoute] Guid taskId,
        [FromBody] CreateOrUpdateTaskCommentRequest request)
    {
        var result = await crmService.CreateOrUpdateTaskComment(taskId, request, User.GetId());
        await hub.NotifyChanges(taskId);
        return result.ActionResult;
    }

    /// <summary>
    /// Поиск по комментам
    /// </summary>
    /// <param name="taskId"></param>
    /// <param name="request"></param>
    /// <returns></returns>
    [HttpPost("Tasks/{taskId:Guid}/Comments/Search")]
    public async Task<ActionResult<TaskCommentDTO>> SearchComments(
        [FromRoute] Guid taskId,
        [FromBody]SearchTaskCommentsRequest request)
    {
        var result = await crmService.Search(taskId, request);
        return result.ActionResult;
    }
    
    /// <summary>
    /// Удалить коммент
    /// </summary>
    /// <returns></returns>
    [HttpPost("Tasks/{taskId:Guid}/Comments/{commentId:Guid}")]
    public async Task<ActionResult> DeleteTaskComment(
        [FromRoute] Guid taskId,
        [FromRoute] Guid commentId)
    {
        await crmService.DeleteTaskComment(taskId, commentId);
        await hub.NotifyChanges(taskId);
        return NoContent();
    }
}