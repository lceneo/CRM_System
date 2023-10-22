using API.Infrastructure;
using API.Modules.ProfilesModule.DTO;

namespace API.Modules.ProfilesModule.Ports;

public interface IProfilesService
{
    Task<Result<ProfileOutDTO>> GetProfileAsync(Guid id);
    Task CreateOrUpdateProfile(ProfileDTO profileDto);
}