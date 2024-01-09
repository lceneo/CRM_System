using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.ProfilesModule.Entities;
using API.Modules.StaticModule.Entities;

namespace API.Modules.ChatsModule.Entities;

public class MessageEntity : IEntity
{
    [Key] public Guid Id { get; set; }
    public ChatEntity Chat { get; set; }
    public ProfileEntity? Sender { get; set; }
    public string? Message { get; set; }
    public MessageType Type { get; set; }
    public DateTime DateTime { get; set; }
    public HashSet<FileEntity>? Files { get; set; }
    public HashSet<CheckEntity>? Checks { get; set; }
}

public enum MessageType
{
    System,
    Text,
    File,
}