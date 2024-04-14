using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.CrmModule.Tasks.Entities;

namespace API.Modules.ProductsModule;

public class ProductEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public int Price { get; set; }
    public string Description { get; set; }
    public HashSet<TaskEntity> Tasks { get; set; }
}