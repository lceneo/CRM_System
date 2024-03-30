using API.Modules.CrmModule.Entities;

namespace API.Modules.CrmModule.Models;

public class SearchTasksRequest
{
    public HashSet<Guid>? Ids { get; set; }
    public Guid? AssignedTo { get; set; }
    public TaskState? State { get;set; }
    public string? Title { get; set; }
}