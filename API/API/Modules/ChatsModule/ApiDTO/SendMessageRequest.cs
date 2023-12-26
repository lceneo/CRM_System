namespace API.Modules.ChatsModule.ApiDTO;

public class SendMessageRequest
{
    public Guid RecipientId { get; set; }
    public string Message { get; set; }
    public string? FileName { get; set; }
    public string? FileUrl { get; set; }
    public int RequestNumber { get; set; }
}