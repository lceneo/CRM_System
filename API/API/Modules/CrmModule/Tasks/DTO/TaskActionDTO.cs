using API.Modules.ProfilesModule.DTO;

namespace API.Modules.CrmModule.Tasks.DTO;

public class TaskActionDTO
{
    public Guid Id { get; set; }
    public ProfileOutDTO User { get; set; }
    public DateTime DateTime { get; set; }
}