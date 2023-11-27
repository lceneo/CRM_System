using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.AccountsModule.Ports;
using API.Modules.ProfilesModule.ApiDTO;
using API.Modules.ProfilesModule.DTO;
using API.Modules.ProfilesModule.Entities;
using API.Modules.ProfilesModule.Ports;
using AutoMapper;

namespace API.Modules.ProfilesModule.Adapters;

public class ProfilesService : IProfilesService
{
    private IProfilesRepository profilesRepository;
    private readonly IMapper mapper;
    private readonly IAccountsRepository accountsRepository;

    public ProfilesService(IMapper mapper, 
        IProfilesRepository profilesRepository,
        IAccountsRepository accountsRepository)
    {
        this.mapper = mapper;
        this.profilesRepository = profilesRepository;
        this.accountsRepository = accountsRepository;
    }

    public async Task<Result<ProfileOutDTO>> GetProfileAsync(Guid id)
    {
        var profile = await profilesRepository.GetByIdAsync(id);
        if (profile == null)
            return Result.NotFound<ProfileOutDTO>("Профиль не существует");

        return Result.Ok(mapper.Map<ProfileOutDTO>(profile));
    }

    public async Task<Result<CreateResponse>> CreateOrUpdateProfile(Guid accountId, ProfileDTO profileDto)
    {
        var profile = mapper.Map<ProfileEntity>(profileDto);
        profile.Id = accountId;
        profile.Account = await accountsRepository.GetByIdAsync(accountId);
        var response = await profilesRepository.CreateOrUpdateAsync(profile);
        return Result.Ok(response);
    }

    public Result<ProfilesSearchResponse> Search(ProfilesSearchRequest searchReq)
    {
        var response = profilesRepository.Search(searchReq);
        return Result.Ok(new ProfilesSearchResponse
        {
            TotalCount = response.TotalCount,
            Items = response.Items
                .Select(mapper.Map<ProfileOutDTO>)
                .ToList(),
        });
    }
}