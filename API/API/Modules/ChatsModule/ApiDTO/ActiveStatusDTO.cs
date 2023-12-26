namespace API.Modules.ChatsModule.ApiDTO;

public class ActiveStatusDTO
{
    public Guid UserId { get; set; }
    public ActiveStatus Status { get; set; }
}

public enum ActiveStatus
{
    Connected,
    Disconnected,
}