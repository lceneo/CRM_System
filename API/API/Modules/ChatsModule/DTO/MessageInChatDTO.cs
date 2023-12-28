using API.Modules.ChatsModule.Entities;
using API.Modules.ProfilesModule.DTO;
using API.Modules.StaticModule.Models;

namespace API.Modules.ChatsModule.DTO;

public class MessageInChatDTO
{
    public Guid Id { get; set; }
    public ProfileOutShortDTO? Sender { get; set; }
    public string? Message { get; set; }
    public IEnumerable<FileInMessageDTO>? Files { get; set; }
    public MessageType Type { get; set; }
    public DateTime DateTime { get; set; }
}