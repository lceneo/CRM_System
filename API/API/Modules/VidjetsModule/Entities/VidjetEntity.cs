using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.AccountsModule.Entities;

namespace API.Modules.VidjetsModule.Entities;

public class VidjetEntity : IEntity
{
    [Key] public Guid Id { get; set; }
    public AccountEntity Account { get; set; }
    public string Domen { get; set; }
    public string Styles { get; set; }
}