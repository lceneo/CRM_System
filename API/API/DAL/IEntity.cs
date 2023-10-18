using System.ComponentModel.DataAnnotations;

namespace API.DAL;

public interface IEntity
{
    [Key]
    public Guid Id { get; set; }
}