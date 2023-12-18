using API.Modules.StaticModule.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

namespace API.Modules.StaticModule.Ports;

public interface IStaticsService
{
    Task<ActionResult<UploadResponse>> UploadFile(Guid userId, IFormFile file);
    Task<ActionResult<IFileInfo>> GetFile(Guid userId, string fileName);
}