using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.DTO;

public class ChatShortDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public ChatStatus Status { get; set; }
}