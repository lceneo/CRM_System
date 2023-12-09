namespace API.Modules.ChatsModule.ApiDTO;

public class SendMessageResponse
{
    public Guid ChatId { get; set; }
    public Guid MessageId { get; set; }
    public DateTime TimeStamp { get; set; }
    public int RequestNumber { get; set; }
}