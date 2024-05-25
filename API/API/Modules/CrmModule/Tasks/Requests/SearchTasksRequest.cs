using API.Modules.CrmModule.Tasks.Entities;

namespace API.Modules.CrmModule.Tasks.Requests;

public class SearchTasksRequest
{
    public HashSet<Guid>? Ids { get; set; }
    public Guid? AssignedTo { get; set; }
    public Guid? ColumnId { get;set; }
    public string? Title { get; set; }
    public Guid? ClientId { get; set; }
}