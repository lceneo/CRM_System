using System.ComponentModel.DataAnnotations;
using API.DAL;

namespace API.Modules.AccountsModule.Models;

public class AccountEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public string Login { get; set; }
    public string PasswordHash { get; set; }
    public AccountRole Role { get; set; }
}