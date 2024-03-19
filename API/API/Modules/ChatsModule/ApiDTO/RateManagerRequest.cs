namespace API.Modules.ChatsModule.ApiDTO;

public class RateManagerRequest
{
    public Guid ChatId { get; set; }
    public int Rating { get; set; }
}