using API.Modules.CrmModule.Entities;
using API.Modules.ProfilesModule.DTO;

namespace API.Modules.CrmModule.DTO;

public class TaskDTO
{
    public Guid Id { get; set; }
    public ProfileOutDTO? AssignedTo { get; set; }
    public TaskState State { get; set; }
    public string Title { get; set; }
    public string Descrption { get; set; }
    public TaskActionDTO Creation { get; set; }
    public TaskActionDTO LastEdition { get; set; }
    public IEnumerable<TaskCommentEntity> Comments { get; set; }
}