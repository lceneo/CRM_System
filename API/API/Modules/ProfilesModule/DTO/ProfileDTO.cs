namespace API.Modules.ProfilesModule.DTO;

public class ProfileDTO
{
    public Guid Id { get; set; }
    public string Surname { get; set; }
    public string Name { get; set; }
    public string? Patronimic { get; set; }
    public string? About { get; set; }
}