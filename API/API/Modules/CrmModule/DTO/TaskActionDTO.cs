namespace API.Modules.CrmModule.DTO;
using API.Modules.ProfilesModule.DTO;

public class TaskActionDTO
{
    public Guid Id { get; set; }
    public ProfileOutDTO Initiator { get; set; }
    public DateTime DateTime { get; set; }
}