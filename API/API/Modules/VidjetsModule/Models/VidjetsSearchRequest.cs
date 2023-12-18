using API.Infrastructure.BaseApiDTOs;

namespace API.Modules.VidjetsModule.Models;

public class VidjetsSearchRequest : SearchRequestBaseDTO
{
    public HashSet<Guid>? UserIds { get; set; }
    public HashSet<Guid>? Ids { get; set; }
    public string? Domen { get; set; }
}