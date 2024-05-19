using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.ApiDTO;

public class ChangeChatRequest
{
    public Guid ChatId { get; set; }
    public ChatStatus? Status { get; set; }
    public Guid? ClientId { get; set; }
}