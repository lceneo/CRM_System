using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.ApiDTO;

public class ChangeChatStatusRequest
{
    public ChatStatus Status { get; set; }
}