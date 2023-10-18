using API.Modules.AccountsModule.Adapters;
using API.Modules.AccountsModule.Models;

namespace API.DAL.DbCreator.DbFillers;

public class AccountsFiller : IDbFiller
{
    public static void Fill(DataContext dataContext)
    {
        var set = dataContext.Accounts;
        set.Add(Account("Admin", "Admin", AccountRole.Admin));
    }

    private static AccountEntity Account(string login, string password, AccountRole role)
    {
        return new AccountEntity
        {
            Login = login,
            PasswordHash = PasswordHasher.CalculateHashStatic(password),
            Role = role,
        };
    }
}