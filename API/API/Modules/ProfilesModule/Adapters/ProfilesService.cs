using System.Net;
using API.Infrastructure;
using API.Modules.AccountsModule.Ports;
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
            return Result.Fail<ProfileOutDTO>("Профиль не существует", HttpStatusCode.NotFound);

        return Result.Ok(mapper.Map<ProfileOutDTO>(profile));
    }

    public async Task CreateOrUpdateProfile(Guid accountId, ProfileDTO profileDto)
    {
        var profile = mapper.Map<ProfileEntity>(profileDto);
        profile.Account = await accountsRepository.GetByIdAsync(accountId);
        await profilesRepository.CreateOrUpdateAsync(profile);
    }
}