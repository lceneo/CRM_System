using API.Modules.ProfilesModule.DTO;

namespace API.Modules.CrmModule.Comments.DTO;

public class TaskCommentDTO
{
    public Guid Id { get; set; }
    public ProfileOutShortDTO Author { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastEditedAt { get; set; }
}