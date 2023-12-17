using API.Extensions;
using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.StaticModule.Models;
using API.Modules.StaticModule.Ports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.StaticModule;

[Route("api/[controller]")]
[ApiController]
public class StaticsController : ControllerBase
{
    private readonly IStaticsService staticsesService;

    public StaticsController(IStaticsService staticsesService)
    {
        this.staticsesService = staticsesService;
    }

    [HttpPost("Upload")]
    [Authorize]
    public async Task<ActionResult<UploadResponse>> UploadAsync(IFormFile file)
    {
        return await staticsesService.UploadFile(User.GetId(), file);
    }

    [HttpPost("Download")]
    public async Task<ActionResult> DownloadAsync([FromBody] DownloadRequest request)
    {
        var fileResponse = await staticsesService.GetFile(User.GetId(), request.FileName);
        if (fileResponse.Value == null)
            return fileResponse.Result!;

        await HttpContext.Response.SendFileAsync(fileResponse.Value);
        return Ok();
    }
}