using System.Security.Claims;
using API.Modules.AccountsModule.Entities;

namespace API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetId(this ClaimsPrincipal user)
    {
        var id = user.Claims
            .First(claim => claim.Type.EndsWith(ClaimTypes.NameIdentifier))
            .Value;

        return Guid.Parse(id);
    }

    public static AccountRole GetRole(this ClaimsPrincipal user)
    {
        var role = user.Claims
            .First(claim => claim.Type.EndsWith(ClaimTypes.Role))
            .Value;

        return (AccountRole) Enum.Parse(typeof(AccountRole), role);
    }
}