using System.Security.Claims;

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
}