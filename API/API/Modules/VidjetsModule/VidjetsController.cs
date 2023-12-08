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
    public async Task<ActionResult> GetVidjetsAsync()
    {
        throw new NotImplementedException();
    }

    [HttpGet("{vidjetId:Guid}")]
    public async Task<ActionResult> GetVidjetByIdAsync([FromRoute] Guid vidjetId)
    {
        throw new NotImplementedException();
    }
    
    [HttpPost]
    public async Task<ActionResult> CreateOrUpdateVidjet(VidjetCreateRequest vidjetCreateRequest)
    {
        throw new NotImplementedException();
    }

    [HttpDelete("{vidjetId:Guid}")]
    public async Task<ActionResult> DeleteVidjetAsync([FromRoute] Guid vidjetId)
    {
        throw new NotImplementedException();
    }

    [AllowAnonymous]
    [HttpPost("Init")]
    public async Task<ActionResult<VidjetResponse>> GetTokenAsync()
    {
        var ip = HttpContext.Connection.RemoteIpAddress;
        if (ip == null)
            return BadRequest("IP is required");
        var request = new VidjetRequest
        {
            Domen = HttpContext?.Request?.Headers?.Origin ?? "",
        };

        var response = await vidjetsService.ResolveVidjetForBuyerAsync(request, ip.MapToIPv4().GetHashCode());

        return response.ActionResult;
    }

    [AllowAnonymous]
    [HttpPost("TestIP")]
    public async Task<ActionResult<VidjetResponse>> TestIP()
    {
        var ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4();
        
        return Ok(new
        {
            IP = ip.ToString(), 
            Hash = ip.MapToIPv4().GetHashCode(),
            Origin = HttpContext.Request.Headers.Origin,
            Domein = HttpContext.Request.Headers.From,
            D = HttpContext.Request.Headers.Via,
        });
    }
}