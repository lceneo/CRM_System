using API.Modules.CrmModule.Tasks.Entities;

namespace API.Modules.CrmModule.Tasks.Requests;

public class CreateOrUpdateTaskRequest
{
    public Guid? Id { get; set; }
    public Guid? AssignedTo { get; set; }
    public TaskState? State { get; set; }
    public string? Title { get; set; }
    public string? Descrption { get; set; }
}