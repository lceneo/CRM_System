using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.CrmModule.Tasks.Entities;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.CrmModule.Comments;

public class TaskCommentEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public TaskEntity Task { get; set; }
    public ProfileEntity Author { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastEditedAt { get; set; }
}