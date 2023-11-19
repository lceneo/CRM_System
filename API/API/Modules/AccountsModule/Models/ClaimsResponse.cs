using System.Security.Claims;
using API.Modules.AccountsModule.Entities;

namespace API.Modules.AccountsModule.Models;

public class ClaimsResponse
{
    public ClaimsIdentity Credentials;
    public Guid Id;
    public AccountRole Role;

    public ClaimsResponse(ClaimsIdentity credentials, Guid id, AccountRole role)
    {
        Credentials = credentials;
        Id = id;
        Role = role;
    }
}