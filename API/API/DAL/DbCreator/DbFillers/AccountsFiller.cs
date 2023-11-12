using API.Modules.AccountsModule.Adapters;
using API.Modules.AccountsModule.Entities;
using API.Modules.AccountsModule.Models;
using API.Modules.ProfilesModule.Entities;

namespace API.DAL.DbCreator.DbFillers;

public class AccountsFiller : IDbFiller
{
    public static void Fill(DataContext dataContext)
    {
        var accounts = dataContext.Accounts;
        var profiles = dataContext.Profiles;
        var adminAcc = Account("admin", "admin", AccountRole.Admin);
        var emptyAcc = Account("empty", "empty", AccountRole.Manager);
        var normalAcc = Account("manager", "manager", AccountRole.Manager);
        var clientAcc = Account("client", "client", AccountRole.Client);
        accounts.Add(adminAcc);
        accounts.Add(emptyAcc);
        accounts.Add(normalAcc);
        accounts.Add(clientAcc);

        profiles.Add(Profile(adminAcc));
        profiles.Add(Profile(normalAcc));
        profiles.Add(Profile(clientAcc));
    }

    private static AccountEntity Account(string login, string password, AccountRole role)
    {
        return new AccountEntity
        {
            Login = login,
            Email = $@"{login}@{login}.com",
            PasswordHash = PasswordHasher.CalculateHashStatic(password),
            Role = role,
        };
    }

    private static ProfileEntity Profile(AccountEntity account)
    {
        return new ProfileEntity
        {
            Id = account.Id,
            Account = account,
            Name = $"Name of {account.Login}",
            Surname = $"Surname of {account.Login}",
            Patronimic = $"Patronimic of account.Login",
            About = $"About of {account.Login}",
        };
    }
}