using API.Infrastructure.BaseApiDTOs;

namespace API.Modules.ClientsModule.Requests;

public class SearchClientsRequest : SearchRequestBaseDTO
{
    public string? Surname { get; set; }
    public string? Name { get; set; }
    public string? Patronymic { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Description { get; set; }
}