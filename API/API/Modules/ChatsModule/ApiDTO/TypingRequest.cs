namespace API.Modules.ChatsModule.ApiDTO;

public class TypingRequest
{
    public Guid ChatId { get; set; }
    public string Text { get; set; }
}