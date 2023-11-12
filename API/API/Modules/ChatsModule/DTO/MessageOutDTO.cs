namespace API.Modules.ChatsModule.DTO;

public class MessageOutDTO
{
    public Guid Id { get; set; }
    public Guid ChatId { get; set; }
    public Guid SenderId { get; set; }
    public string Message { get; set; }
    public DateTime DateTime { get; set; }
}