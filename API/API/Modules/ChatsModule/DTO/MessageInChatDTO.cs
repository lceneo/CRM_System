using API.Modules.ProfilesModule.DTO;

namespace API.Modules.ChatsModule.DTO;

public class MessageInChatDTO
{
    public Guid Id { get; set; }
    public ProfileOutShortDTO Sender { get; set; }
    public string Message { get; set; }
    public DateTime DateTime { get; set; }
}