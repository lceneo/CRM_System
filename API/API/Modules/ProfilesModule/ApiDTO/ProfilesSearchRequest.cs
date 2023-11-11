using API.Infrastructure.BaseApiDTOs;
using API.Modules.AccountsModule.Entities;

namespace API.Modules.ProfilesModule.ApiDTO;

public class ProfilesSearchRequest : SearchRequestBaseDTO
{
    public AccountRole? Role { get; set; }
}