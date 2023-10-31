using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.ChatsModule.Entities;

public class ChatEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public HashSet<ProfileEntity> Profiles { get; set; }
}