using API.DAL;
using API.Modules.AccountsModule.Models;

namespace API.Modules.AccountsModule.Ports;

public interface IAccountsRepository : ICRUREpository<AccountEntity>
{
    public Task<AccountEntity?> GetByLoginAsync(string login);
}