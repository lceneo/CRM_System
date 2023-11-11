using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ProfilesModule.ApiDTO;
using API.Modules.ProfilesModule.DTO;

namespace API.Modules.ProfilesModule.Ports;

public interface IProfilesService
{
    Task<Result<ProfileOutDTO>> GetProfileAsync(Guid id);
    Task<Result<CreateResponse>> CreateOrUpdateProfile(Guid accountId, ProfileDTO profileDto);
    Result<ProfilesSearchResponse> Search(ProfilesSearchRequest searchReq);
}