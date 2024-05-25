using API.DAL;
using API.Modules.CrmModule.Tasks.Entities;

namespace API.Modules.CrmModule.Taskcolumns.Entities;

public class TaskColumnEntity : IEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Order { get; set; }
    public string? Color { get; set; }
    public HashSet<TaskEntity>? Tasks { get; set; }
}