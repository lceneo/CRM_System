using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.DAL;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.StaticModule.Entities;

public class FileEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public string FileKey { get; set; }
    public string FileName { get; set; }
    public ProfileEntity Profile { get; set; }
}