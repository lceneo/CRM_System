using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.ApiDTO;

public class ChatsSearchRequest : SearchRequestBaseDTO
{
    public HashSet<Guid>? UserIds { get; set; }
    public string? ChatName { get; set; }
    public ChatStatus? ChatStatus { get; set; }
}