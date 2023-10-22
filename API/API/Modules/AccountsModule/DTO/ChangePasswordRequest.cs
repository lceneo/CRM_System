using System.ComponentModel.DataAnnotations;

namespace API.Modules.AccountsModule.DTO;

public class ChangePasswordRequest
{
    [Required]
    public string OldPassword { get; set; }
    [Required]
    public string NewPassword { get; set; }
}