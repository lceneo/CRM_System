using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.DTO;

public class MessagesSearchRequest
{
    public HashSet<Guid>? MessageIds { get; set; }
    public Guid? Sender { get; set; }
    public MessageType? Type { get; set; }
    public int Take { get; set; } = int.MaxValue;
    public int Skip { get; set; } = 0;
}