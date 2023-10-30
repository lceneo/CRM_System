using System.ComponentModel.DataAnnotations;
using API.DAL;

namespace API.Modules.MailsModule.Entities;

public class MailMessageEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public DateTime Time { get; set; }
    public string Title { get; set; }
    public string? Error { get; set; }
}