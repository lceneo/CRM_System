namespace API.Modules.ChatsModule.DTO;

public class ChatOutDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public MessageInChatDTO LastMessage { get; set; }
}