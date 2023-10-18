using API.Modules.AccountsModule.Models;

namespace API.Modules.AccountsModule.DTO;

public class RegisterRequest
{
    public string Login { get; set; }
    public string Password { get; set; }
    public AccountRole Role { get; set; }
}