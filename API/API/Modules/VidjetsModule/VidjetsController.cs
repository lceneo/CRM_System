using System.Text;
using API.Extensions;
using API.Modules.VidjetsModule.Models;
using API.Modules.VidjetsModule.Ports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.VidjetsModule;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class VidjetsController : ControllerBase
{
    private readonly IVidjetsService vidjetsService;

    public VidjetsController(
        IVidjetsService vidjetsService)
    {
        this.vidjetsService = vidjetsService;
    }

    [HttpGet]
    public async Task<ActionResult> GetVidjetsAsync([FromQuery] VidjetsSearchRequest searchReq)
    {
        var response = await vidjetsService.GetVidjetsAsync(searchReq);
        return response.ActionResult;
    }

    [HttpGet("{vidjetId:Guid}")]
    public async Task<ActionResult> GetVidjetByIdAsync([FromRoute] Guid vidjetId)
    {
        var response = await vidjetsService.GetVidjetByIdAsync(vidjetId);
        return response.ActionResult;
    }

    [HttpPost]
    public async Task<ActionResult> CreateOrUpdateVidjet(VidjetCreateRequest vidjetCreateRequest)
    {
        var response = await vidjetsService.CreateOrUpdateVidjet(User.GetId(), vidjetCreateRequest);

        return response.ActionResult;
    }

    [HttpDelete("{vidjetId:Guid}")]
    public async Task<ActionResult> DeleteVidjetAsync([FromRoute] Guid vidjetId)
    {
        await vidjetsService.DeleteVidjetAsync(vidjetId);
        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("Script")]
    public async Task<ActionResult> GetScript()
    {
        var sb = new StringBuilder();
        sb.Append(@"console.log(`Виджет работает`)");
        return Content(sb.ToString(), "text/html");
    }

    [AllowAnonymous]
    [HttpPost("Init")]
    public async Task<ActionResult<VidjetResponse>> GetTokenAsync()
    {
        var request = new VidjetRequest
        {
            Domen = GetDomenFromOrigin(HttpContext.Request.Headers.Origin),
        };

        var response = await vidjetsService.ResolveVidjetForBuyerAsync(request);

        return response.ActionResult;
    }

    [AllowAnonymous]
    [HttpPost("TestIP")]
    public async Task<ActionResult<VidjetResponse>> TestIP()
    {
        return Ok(new
        {
            Origin = HttpContext.Request.Headers.Origin,
            Domen = GetDomenFromOrigin(HttpContext.Request.Headers.Origin),
        });
    }

    private string GetDomenFromOrigin(string origin)
        => origin.Substring(origin.IndexOf("://") + 3);
}