using API.Modules.ProfilesModule.DTO;

namespace API.Modules.ChatsModule.ApiDTO;

public class CheckMessagesResponse
{
    public ProfileOutShortDTO Checker { get; set; }
    public Guid ChatId { get; set; }
    public IEnumerable<Guid> MessageIds { get; set; }
}