namespace API.Modules.AccountsModule.Ports;

public interface IPasswordHasher
{
    string CalculateHash(string password);
    bool IsPasswordEqualHashed(string hashedPassword, string inputPassword);
}