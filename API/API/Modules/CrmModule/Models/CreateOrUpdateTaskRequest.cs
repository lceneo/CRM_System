using API.Modules.CrmModule.Entities;

namespace API.Modules.CrmModule.Models;

public class CreateOrUpdateTaskRequest
{
    public Guid? Id { get; set; }
    public Guid? AssignedTo { get; set; }
    public TaskState? State { get; set; }
    public string? Title { get; set; }
    public string? Descrption { get; set; }
}