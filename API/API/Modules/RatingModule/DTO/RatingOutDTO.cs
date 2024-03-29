using API.Modules.ChatsModule.DTO;
using API.Modules.ProfilesModule.DTO;

namespace API.Modules.RatingModule.Entities;

public class RatingOutDTO
{
    public Guid Id { get; set; }
    public ProfileOutDTO Manager { get; set; }
    public ChatShortDTO Chat { get; set; }
    public string Comment { get; set; }
    public float Score { get; set; }
}