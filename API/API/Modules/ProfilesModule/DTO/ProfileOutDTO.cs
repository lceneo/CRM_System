using API.Modules.AccountsModule.Entities;

namespace API.Modules.ProfilesModule.DTO;

public class ProfileOutDTO
{
    public Guid Id { get; set; }
    public string Surname { get; set; }
    public string Name { get; set; }
    public string? Patronimic { get; set; }
    public string? About { get; set; }
    public AccountRole Role { get; set; }
    public string? StartMessage { get; set; }
    public string? EndMesssage { get; set; }
}