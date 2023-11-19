using API.Modules.ProfilesModule.DTO;
using API.Modules.ProfilesModule.Entities;
using AutoMapper;

namespace API.Modules.ProfilesModule.Mapping;

public class ProfilesMapping : Profile
{
    public ProfilesMapping()
    {
        CreateMap<ProfileEntity, ProfileOutDTO>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Account.Role));
        CreateMap<ProfileEntity, ProfileOutShortDTO>();

        CreateMap<ProfileDTO, ProfileEntity>();
    }
}