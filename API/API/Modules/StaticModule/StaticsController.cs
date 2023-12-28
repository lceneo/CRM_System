using System.Text.Json;
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
[Authorize]
public class StaticsController : ControllerBase
{
    private readonly IStaticsService staticsService;

    public StaticsController(IStaticsService staticsService)
    {
        this.staticsService = staticsService;
    }

    [HttpPost("Upload")]
    public async Task<ActionResult<UploadResponse>> UploadAsync(IFormFile file)
    {
        var response = await staticsService.UploadFile(User.GetId(), file);
        return response.ActionResult;
    }
    
    [HttpPost("Upload/Concrete")]
    public async Task<ActionResult<UploadResponse>> UploadConcreteAsync(IFormFile file)
    {
        var response = await staticsService.UploadConcreteFile(file);
        return response.ActionResult;
    }

    [HttpPost("Download")]
    public async Task DownloadAsync([FromBody] DownloadRequest request)
    {
        var response = await staticsService.GetFile(User.GetId(), request.FileKey);
        if (!response.IsSuccess)
        {
            HttpContext.Response.StatusCode = (int) response.StatusCode;
            await HttpContext.Response.WriteAsync(JsonSerializer.Serialize(response.Error));
            return;
        }

        await HttpContext.Response.SendFileAsync(response.Value.FileInfo);
    }
}