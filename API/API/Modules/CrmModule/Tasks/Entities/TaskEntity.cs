using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.CrmModule.Comments;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.CrmModule.Tasks.Entities;

public class TaskEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public ProfileEntity? AssignedTo { get; set; }
    public TaskState State { get; set; }
    public string Title { get; set; }
    public string Descrption { get; set; }
    public HashSet<TaskActionEntity> Actions { get; set; }
    public HashSet<TaskCommentEntity> Comments { get; set; }
}

public enum TaskState
{
    New,
    Pause,
    InProgress,
    Done,
    Archived,
}