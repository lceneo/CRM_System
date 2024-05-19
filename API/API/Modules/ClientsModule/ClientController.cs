using API.Infrastructure.BaseApiDTOs;
using API.Modules.ClientsModule.DTO;
using API.Modules.ClientsModule.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.ClientsModule;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ClientController : ControllerBase
{
    private readonly IClientsService clientsService;

    public ClientController(IClientsService clientsService)
    {
        this.clientsService = clientsService;
    }

    /// <summary>
    /// Поиск по клиентам
    /// </summary>
    /// <returns></returns>
    [HttpPost("Search")]
    public async Task<ActionResult<SearchResponseBaseDTO<ClientDTO>>> SearchClient(
        [FromBody] SearchClientsRequest request)
    {
        var res = await clientsService.Search(request);
        return res.ActionResult;
    }

    /// <summary>
    /// Создаёт или обновляет существующего клиента.
    ///
    /// Чтобы обновить нужно указать `Id`
    /// </summary>
    /// <returns></returns>
    [HttpPost]
    public async Task<ActionResult<CreateResponse>> CreateOrUpdate(
        [FromBody] CreateOrUpdateClientRequest request)
    {
        var res = await clientsService.CreateOrUpdateClient(request);
        return res.ActionResult;
    }

    /// <summary>
    /// Удаляет клиента
    /// </summary>
    /// <returns></returns>
    [HttpDelete("{clientId:Guid}")]
    public async Task<ActionResult> DeleteAsync([FromRoute] Guid clientId)
    {
        var res = await clientsService.Delete(clientId);
        return res.ActionResult;
    }
}