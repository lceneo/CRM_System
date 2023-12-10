using API.Modules.AccountsModule.Entities;

namespace API.Modules.AccountsModule.Models;

public class AccountsResponse
{
    public Guid Id { get; set; }
    public AccountRole Role { get; set; }
    public string JwtToken { get; set; }
}