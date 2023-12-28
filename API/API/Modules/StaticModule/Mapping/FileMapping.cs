using API.Modules.StaticModule.Entities;
using API.Modules.StaticModule.Models;
using AutoMapper;

namespace API.Modules.StaticModule.Mapping;

public class FileMapping : Profile
{
    public FileMapping()
    {
        CreateMap<FileEntity, FileInMessageDTO>();
    }
}