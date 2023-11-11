using System.Security.Claims;
using API.Modules.AccountsModule.Entities;

namespace API.Modules.AccountsModule.Models;

public struct ClaimsResponse
{
    public ClaimsIdentity Credentials;
    public AccountRole Role;

    public ClaimsResponse(ClaimsIdentity credentials, AccountRole role)
    {
        Credentials = credentials;
        Role = role;
    }
}