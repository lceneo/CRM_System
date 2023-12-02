using System.Security.Claims;
using API.Modules.AccountsModule.Entities;

namespace API.Modules.AccountsModule.Models;

public class ClaimsResponse
{
    public ClaimsIdentity Credentials { get; set; }
    public Guid Id { get; set; }
    public AccountRole Role { get; set; }
    public string JwtToken { get; set; }

    public ClaimsResponse(ClaimsIdentity credentials, Guid id, AccountRole role, string jwtToken)
    {
        Credentials = credentials;
        Id = id;
        Role = role;
        JwtToken = jwtToken;
    }
}