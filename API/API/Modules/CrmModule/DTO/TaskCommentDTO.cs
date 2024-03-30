namespace API.Modules.CrmModule.DTO;
using API.Modules.ProfilesModule.DTO;

public class TaskCommentDTO
{
    public Guid Id { get; set; }
    public ProfileOutDTO Author { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
}