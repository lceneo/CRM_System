using System.ComponentModel.DataAnnotations;
using API.DAL;

namespace API.Modules.ChatsModule.Entities;

public class MessageEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public ChatEntity ChatId { get; set; }
    public string Message { get; set; }
    public DateTime DateTime { get; set; }
}