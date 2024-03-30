using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.CrmModule.Entities;

public class TaskActionEntity : IEntity
{
    [Key]
    public Guid Id { get; set; }
    public TaskEntity Task { get; set; }
    public ProfileEntity Initiator { get; set; }
    public DateTime DateTime { get; set; }
}