using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.ChatsModule.Entities;

namespace API.Modules.StaticModule.Entities;

public class FileEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public string FileKey { get; set; }
    public string FileName { get; set; }
    public MessageEntity Message { get; set; }
}