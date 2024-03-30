using System.ComponentModel.DataAnnotations;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.CrmModule.Entities;

public class TaskCommentEntity
{
    [Key]
    public Guid Id { get; set; }
    public TaskEntity Task { get; set; }
    public ProfileEntity Author { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
}