using API.Modules.ChatsModule.Entities;
using API.Modules.ProfilesModule.DTO;

namespace API.Modules.ChatsModule.DTO;

public class ChatOutDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public IEnumerable<ProfileInChatDTO> Profiles { get; set; }
    public MessageInChatDTO LastMessage { get; set; }
    public ChatStatus Status { get; set; }
}