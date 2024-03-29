namespace API.Modules.ChatsModule.ApiDTO;

public class RateManagerRequest
{
    public Guid ChatId { get; set; }
    public int Score { get; set; }
    public string Comment { get; set; }
}