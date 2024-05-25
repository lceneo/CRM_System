namespace API.Modules.CrmModule.Tasks.Requests;

public class CreateOrUpdateTaskRequest
{
    public Guid? Id { get; set; }
    public Guid? AssignedTo { get; set; }
    public Guid? ColumnId { get; set; }
    public string? Title { get; set; }
    public string? Descrption { get; set; }
    public int? Priority { get; set; }
    public IEnumerable<Guid>? ProductIds { get; set; }
    public Guid? ClientId { get; set; }
}