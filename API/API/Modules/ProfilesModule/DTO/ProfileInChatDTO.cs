namespace API.Modules.ProfilesModule.DTO;

public class ProfileInChatDTO
{
    public Guid Id { get; set; }
    public string Surname { get; set; }
    public string Name { get; set; }
    public bool IsConnected { get; set; }
}