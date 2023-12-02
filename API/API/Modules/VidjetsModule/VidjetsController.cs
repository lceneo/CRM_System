using API.Modules.VidjetsModule.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.VidjetsModule;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class VidjetsController : ControllerBase
{

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
    [HttpPost("VidjetInfo")]
    public async Task<ActionResult<VidjetResponse>> GetTokenAsync(VidjetRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress;
        if (ip == null)
            return BadRequest("IP is required");

        return new VidjetResponse
        {
            
        };
    }
}