using System.Text;
using API.Extensions;
using API.Infrastructure;
using API.Modules.VidjetsModule.Models;
using API.Modules.VidjetsModule.Ports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

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
        var response = await vidjetsService.GetVidjetByIdAsync(vidjetId, User.GetId());
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
        await vidjetsService.DeleteVidjetAsync(vidjetId, User.GetId());
        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("Script")]
    public async Task<ActionResult> GetScript()
    {
        using var provider = new PhysicalFileProvider(Config.PathToStatic);
        return Content(provider.GetFileInfo("Script.js").ReadAll(), "text/html");
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