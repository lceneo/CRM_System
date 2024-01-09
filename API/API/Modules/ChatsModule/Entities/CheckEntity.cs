using System.ComponentModel.DataAnnotations;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.ChatsModule.Entities;

public class CheckEntity
{
    [Key]
    public Guid Id { get; set; }
    public MessageEntity Message { get; set; }
    public ProfileEntity Profile { get; set; }
}