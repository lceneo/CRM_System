using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.AccountsModule.Models;

namespace API.Modules.ProfilesModule.Entities;

public class ProfileEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    public AccountEntity Account { get; set; }
    [Required]
    public string Surname { get; set; }
    [Required]
    public string Name { get; set; }
    public string? Patronimic { get; set; }
    public string? About { get; set; }
}