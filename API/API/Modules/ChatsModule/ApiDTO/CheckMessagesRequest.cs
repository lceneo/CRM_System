namespace API.Modules.ChatsModule.ApiDTO;

public class CheckMessagesRequest
{
    public IEnumerable<Guid> MessageIds { get; set; }
}