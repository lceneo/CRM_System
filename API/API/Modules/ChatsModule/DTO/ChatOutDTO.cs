using API.Modules.ChatsModule.Entities;
using API.Modules.ClientsModule.DTO;
using API.Modules.ProfilesModule.DTO;

namespace API.Modules.ChatsModule.DTO;

public class ChatOutDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public IEnumerable<ProfileInChatDTO> Profiles { get; set; }
    public ClientDTO? Client { get; set; }
    public MessageInChatDTO LastMessage { get; set; }
    public ChatStatus Status { get; set; }
    public int UnreadMessagesCount { get; set; }
}