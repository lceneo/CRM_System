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
    private readonly IProfilesRepository profilesRepository;
    private readonly ILog log;

    public StaticsService(
        IStaticsRepository staticsRepository,
        IProfilesRepository profilesRepository,
        ILog log)
    {
        this.pathToStatic = Config.PathToStatic;
        this.staticsRepository = staticsRepository;
        this.profilesRepository = profilesRepository;
        this.log = log;
    }

    public async Task<Result<UploadResponse>> UploadFile(Guid userId, IFormFile file)
    {
        var profile = await profilesRepository.GetByIdAsync(userId);
        if (profile == null)
            return Result.BadRequest<UploadResponse>("Такого пользователя не существует");
        
        var fileEntity = await staticsRepository.Get(file.FileName);
        if (fileEntity != null)
        {
            fileEntity.FileName = file.FileName;
            await staticsRepository.UpdateAsync(fileEntity);
        }
        else
        {
            var fileKey = GenerateFileKey(userId);
            await using var fileStream = GetFileStream(fileKey);
            await file.CopyToAsync(fileStream);
            fileEntity = new FileEntity
            {
                FileKey = fileKey,
                FileName = file.FileName,
            };
            await staticsRepository.CreateAsync(fileEntity);
        }

        await log.Info($"Uploaded file(FileKey: {fileEntity.FileKey}, FileName: {fileEntity.FileName}) by user(Id: {userId})");
        return Result.Ok(new UploadResponse
        {
            FileKey = fileEntity.FileKey
        });
    }

    public async Task<Result<bool>> UploadConcreteFile(IFormFile file)
    {
        var path = pathToStatic + "\\" + file.FileName;
        if (File.Exists(path))
            File.Delete(path);
        
        await using var fileStream = GetFileStream(file.FileName);
        await file.CopyToAsync(fileStream);
        return Result.Ok(true);
    }

    public async Task<Result<DownloadServiceResponse>> GetFile(Guid userId, string fileKey)
    {
        var existed = await staticsRepository.Get(fileKey);
        if (existed == null)
            return Result.NotFound<DownloadServiceResponse>("");
        
        await log.Info($"Downloaded file(FileKey: {existed.FileKey}, FileName: {existed.FileName}) by user(Id: {userId})");
        using var provider = new PhysicalFileProvider(pathToStatic);
        return Result.Ok(new DownloadServiceResponse
        {
            FileName = existed.FileName,
            FileInfo = provider.GetFileInfo(existed.FileKey),
        });
    }

    private FileStream GetFileStream(string fileKey)
        => File.Open(pathToStatic + "\\" + fileKey, FileMode.Create);

    private string GenerateFileKey(Guid userId) 
        => $"{userId}__{Guid.NewGuid()}";
}