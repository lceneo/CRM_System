using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.ChatsModule.Entities;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.RatingModule.Entities;

public class RatingEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public ProfileEntity Manager { get; set; }
    public ChatEntity Chat { get; set; }
    public string Comment { get; set; }
    public float Score { get; set; }
}