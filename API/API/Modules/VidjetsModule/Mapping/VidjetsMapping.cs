using API.Modules.VidjetsModule.DTO;
using API.Modules.VidjetsModule.Entities;
using API.Modules.VidjetsModule.Models;
using AutoMapper;

namespace API.Modules.VidjetsModule.Mapping;

public class VidjetsMapping : Profile
{
    public VidjetsMapping()
    {
        CreateMap<VidjetEntity, VidjetEntity>();
        CreateMap<VidjetEntity, VidjetOutDTO>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Account.Id));
        CreateMap<VidjetCreateOrUpdateRequest, VidjetEntity>()
            .ForMember(dest => dest.Styles, opt => opt.MapFrom(src => src.Styles.ToString()));
    }
}