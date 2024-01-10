namespace API.Modules.ChatsModule.ApiDTO;

public class CheckMessagesRequest
{
    public Guid ChatId { get; set; }
    public IEnumerable<Guid> MessageIds { get; set; }
}