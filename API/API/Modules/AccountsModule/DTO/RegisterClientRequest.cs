using System.ComponentModel.DataAnnotations;

namespace API.Modules.AccountsModule.DTO;

public class RegisterClientRequest
{
    [Required]
    public string Login { get; set; }
    [Required]
    public string Email { get; set; }
}