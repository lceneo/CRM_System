namespace API.Modules.ClientsModule.Requests;

public class CreateClientInHubRequest
{
    public Guid ChatId { get; set; }
    public string? Surname { get; set; }
    public string? Name { get; set; }
    public string? Patronymic { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
}