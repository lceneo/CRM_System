using System.Security.Cryptography;
using API.Modules.AccountsModule.Ports;

namespace API.Modules.AccountsModule.Adapters;

public class PasswordHasher : IPasswordHasher
{
    public string CalculateHash(string password)
    {
        byte[] passwordSalt;
        byte[] passwordHash;
        using (var hmac = new HMACSHA512())
        {
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        }

        var hashBytes = new byte[128 + 64];
        Array.Copy(passwordSalt, 0, hashBytes, 0, 128);
        Array.Copy(passwordHash, 0, hashBytes, 128, 64);

        return Convert.ToBase64String(hashBytes);
    }

    public bool IsPasswordEqualHashed(string hashedPassword, string inputPassword)
    {
        var hashedPasswordBytes = Convert.FromBase64String(hashedPassword);
        var salt = new byte[128];
        var passwordHash = new byte[64];
        Array.Copy(hashedPasswordBytes, 0, salt, 0, 128);
        Array.Copy(hashedPasswordBytes, 128, passwordHash, 0, 64);

        using (var hmac = new HMACSHA512(salt))
        {
            var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(inputPassword));
            return computedHash.SequenceEqual(passwordHash);
        }
    }
    
    public static string CalculateHashStatic(string password)
    {
        byte[] passwordSalt;
        byte[] passwordHash;
        using (var hmac = new HMACSHA512())
        {
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        }

        var hashBytes = new byte[128 + 64];
        Array.Copy(passwordSalt, 0, hashBytes, 0, 128);
        Array.Copy(passwordHash, 0, hashBytes, 128, 64);

        return Convert.ToBase64String(hashBytes);
    }
}