using System.ComponentModel.DataAnnotations;

namespace API.Modules.AccountsModule.DTO;

public class LoginRequest
{
    [Required] public string Login { get; set; }
    [Required] public string Password { get; set; }
}