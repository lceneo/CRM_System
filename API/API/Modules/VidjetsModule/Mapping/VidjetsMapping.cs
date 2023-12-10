using API.Modules.VidjetsModule.DTO;
using API.Modules.VidjetsModule.Entities;
using API.Modules.VidjetsModule.Models;
using AutoMapper;

namespace API.Modules.VidjetsModule.Mapping;

public class VidjetsMapping : Profile
{
    public VidjetsMapping()
    {
        CreateMap<VidjetEntity, VidjetOutDTO>();
        CreateMap<VidjetCreateRequest, VidjetEntity>();
    }
}