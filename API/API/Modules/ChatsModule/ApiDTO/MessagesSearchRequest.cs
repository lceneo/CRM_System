using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.ApiDTO;

public class MessagesSearchRequest
{
    public HashSet<Guid>? MessageIds { get; set; }
    public Guid? Sender { get; set; }
    public MessageType? Type { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int Take { get; set; } = int.MaxValue;
    public int Skip { get; set; } = 0;
}