using API.Modules.ChatsModule;
using API.Modules.ProfilesModule.DTO;
using API.Modules.ProfilesModule.Entities;
using AutoMapper;

namespace API.Modules.ProfilesModule.Mapping;

public class ProfilesMapping : Profile
{
    public ProfilesMapping()
    {
        CreateMap<ProfileEntity, ProfileEntity>();
        CreateMap<ProfileEntity, ProfileOutDTO>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Account.Role));
        CreateMap<ProfileEntity, ProfileOutShortDTO>();
        CreateMap<ProfileEntity, ProfileInChatDTO>()
            .ForMember(dest => dest.IsConnected, opt => opt.ConvertUsing<ProfileActiveStatusConverter, Guid>(src => src.Id));

        CreateMap<ProfileDTO, ProfileEntity>();
    }
}

public class ProfileActiveStatusConverter : IValueConverter<Guid, bool>
{
    private readonly HubConnectionsProvider connectionsProvider;
    public ProfileActiveStatusConverter(HubConnectionsProvider connectionsProvider)
    {
        this.connectionsProvider = connectionsProvider;
    }
    
    public bool Convert(Guid sourceMember, ResolutionContext context)
    {
        return connectionsProvider.Contains(sourceMember);
    }
}