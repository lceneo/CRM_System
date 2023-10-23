using API.Extensions;
using API.Modules.ProfilesModule.DTO;
using API.Modules.ProfilesModule.Ports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.ProfilesModule;

[Route("api/[controller]")]
[ApiController]
public class ProfilesController : ControllerBase
{
    private readonly IProfilesService profilesService;

    public ProfilesController(IProfilesService profilesService)
    {
        this.profilesService = profilesService;
    }

    [Authorize]
    [HttpGet("My")]
    public async Task<ActionResult<ProfileOutDTO>> GetOwnProfileAsync()
    {
        return await GetProfileAsync(User.GetId());
    }
    
    [HttpGet("{id:Guid}")]
    public async Task<ActionResult<ProfileOutDTO>> GetProfileAsync([FromRoute] Guid id)
    {
        var response = await profilesService.GetProfileAsync(id);
        return response.ActionResult;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult> CreateOrUpdateProfileAsync(ProfileDTO profileDto)
    {
        await profilesService.CreateOrUpdateProfile(User.GetId(), profileDto);
        return NoContent();
    }
}