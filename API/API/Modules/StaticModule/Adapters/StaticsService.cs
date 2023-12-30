using API.Infrastructure;
using API.Modules.LogsModule;
using API.Modules.ProfilesModule.Ports;
using API.Modules.StaticModule.Entities;
using API.Modules.StaticModule.Models;
using API.Modules.StaticModule.Ports;
using Microsoft.Extensions.FileProviders;

namespace API.Modules.StaticModule.Adapters;

public class StaticsService : IStaticsService
{
    private readonly string pathToStatic;
    private readonly IStaticsRepository staticsRepository;
    private readonly ILog log;

    public StaticsService(
        IStaticsRepository staticsRepository,
        ILog log)
    {
        this.pathToStatic = Config.PathToStatic;
        this.staticsRepository = staticsRepository;
        this.log = log;
    }

    public async Task<Result<UploadResponse>> UploadFile(IFormFile file)
    {
        var fileKey = GenerateFileKey(Guid.NewGuid());
        await using(var fileStream = File.Create(pathToStatic + "/" + fileKey))
        {
            await file.CopyToAsync(fileStream);
        }
        
        var fileEntity = new FileEntity
        {
            FileKey = fileKey,
            FileName = file.FileName,
        };
        await staticsRepository.CreateAsync(fileEntity);

        await log.Info($"Uploaded file(FileKey: {fileEntity.FileKey}, FileName: {fileEntity.FileName})");
        return Result.Ok(new UploadResponse
        {
            FileKey = fileEntity.FileKey
        });
    }

    public async Task<Result<bool>> UploadConcreteFile(IFormFile file)
    {
        var path = pathToStatic + "/" + file.FileName;
        if (File.Exists(path))
            File.Delete(path);
        
        await using(var fileStream = File.Create(path))
        {
            await file.CopyToAsync(fileStream);
        }
        return Result.Ok(true);
    }

    public async Task<Result<DownloadServiceResponse>> GetFile(string fileKey)
    {
        var existed = await staticsRepository.Get(fileKey);
        if (existed == null)
            return Result.NotFound<DownloadServiceResponse>("");
        
        await log.Info($"Downloaded file(FileKey: {existed.FileKey}, FileName: {existed.FileName})");
        using var provider = new PhysicalFileProvider(pathToStatic);
        return Result.Ok(new DownloadServiceResponse
        {
            FileName = existed.FileName,
            FileInfo = provider.GetFileInfo(existed.FileKey),
        });
    }

    private string GenerateFileKey(Guid userId) 
        => $"{userId}__{Guid.NewGuid()}";
}