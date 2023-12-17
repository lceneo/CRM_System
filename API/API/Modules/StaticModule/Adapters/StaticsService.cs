using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ProfilesModule.Ports;
using API.Modules.StaticModule.Entities;
using API.Modules.StaticModule.Models;
using API.Modules.StaticModule.Ports;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

namespace API.Modules.StaticModule.Adapters;

public class StaticsService : ControllerBase, IStaticsService
{
    private readonly string pathToStatic;
    private readonly IStaticsRepository staticsRepository;
    private readonly IProfilesRepository profilesRepository;

    public StaticsService(
        IStaticsRepository staticsRepository,
        IProfilesRepository profilesRepository)
    {
        this.pathToStatic = Config.PathToStatic;
        this.staticsRepository = staticsRepository;
        this.profilesRepository = profilesRepository;
    }

    public async Task<ActionResult<UploadResponse>> UploadFile(Guid userId, IFormFile file)
    {
        var profile = await profilesRepository.GetByIdAsync(userId);
        if (profile == null)
            return BadRequest("Такого пользователя не существует");
        
        var fileEntity = await staticsRepository.Get(userId, file.FileName);
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
                Profile = profile,
            };
            await staticsRepository.CreateAsync(fileEntity);
        }

        return Ok(new UploadResponse
        {
            FileKey = fileEntity.FileKey
        });
    }

    public async Task<ActionResult<IFileInfo>> GetFile(Guid userId, string fileName)
    {
        var existed = await staticsRepository.Get(userId, fileName);
        if (existed == null)
            return NotFound();
        
        using var provider = new PhysicalFileProvider(pathToStatic);
        return Ok(provider.GetFileInfo(existed.FileKey));
    }

    private FileStream GetFileStream(string fileKey)
        => System.IO.File.Open(pathToStatic + "\\" + fileKey, FileMode.Create);

    private string GenerateFileKey(Guid userId) 
        => $"{userId}__{Guid.NewGuid()}";
}