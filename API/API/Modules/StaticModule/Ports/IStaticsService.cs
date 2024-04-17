using API.Infrastructure;
using API.Modules.StaticModule.ApiModels;

namespace API.Modules.StaticModule.Ports;

public interface IStaticsService
{
    Task<Result<UploadResponse>> UploadFile(IFormFile file);
    Task<Result<bool>> UploadConcreteFile(IFormFile file);
    Task<Result<DownloadServiceResponse>> GetFile(string fileKey);
}