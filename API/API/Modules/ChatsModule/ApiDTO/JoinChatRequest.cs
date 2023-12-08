namespace API.Modules.ChatsModule.ApiDTO;

public class JoinChatRequest
{
    public Guid ChatId { get; set; }
    public int RequestNumber { get; set; }
}