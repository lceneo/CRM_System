using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.ApiDTO;

public class SendMessageResponse
{
    public Guid ChatId { get; set; }
    public Guid MessageId { get; set; }
    public MessageType Type { get; set; }
    public DateTime TimeStamp { get; set; }
    public int RequestNumber { get; set; }
}