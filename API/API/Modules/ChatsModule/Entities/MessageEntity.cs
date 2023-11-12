using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.ChatsModule.Entities;

public class MessageEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public ChatEntity Chat { get; set; }
    public ProfileEntity Sender { get; set; }
    public string Message { get; set; }
    public DateTime DateTime { get; set; }
}