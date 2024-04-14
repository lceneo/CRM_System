using API.Modules.AccountsModule.Entities;

namespace API.Modules.AccountsModule.DTO;

public class AccountsResponse
{
    public Guid Id { get; set; }
    public AccountRole Role { get; set; }
    public string JwtToken { get; set; }
}