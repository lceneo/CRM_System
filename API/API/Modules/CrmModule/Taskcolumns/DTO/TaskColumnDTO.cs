namespace API.Modules.CrmModule.Taskcolumns.DTO;

public class TaskColumnDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Order { get; set; }
    public string? Color { get; set; }
    public IEnumerable<Guid>? TasksIds { get; set; }
}