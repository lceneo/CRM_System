using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.ClientsModule;
using API.Modules.CrmModule.Comments;
using API.Modules.CrmModule.Taskcolumns.Entities;
using API.Modules.ProductsModule;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.CrmModule.Tasks.Entities;

public class TaskEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public ProfileEntity? AssignedTo { get; set; }
    public TaskColumnEntity? Column { get; set; }
    public string Title { get; set; }
    public string Descrption { get; set; }
    public HashSet<TaskActionEntity> Actions { get; set; }
    public HashSet<TaskCommentEntity> Comments { get; set; }
    public HashSet<ProductEntity> Products { get; set; } = new();
    public ClientEntity? Client { get; set; }
}