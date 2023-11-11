using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.AccountsModule.Entities;

namespace API.Modules.AccountsModule.Models;

public class AccountEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    public string Login { get; set; }
    [Required]
    public string Email { get; set; }
    public string? PasswordHash { get; set; }
    public AccountRole Role { get; set; }
}