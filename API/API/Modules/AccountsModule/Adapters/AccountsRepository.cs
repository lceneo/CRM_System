using API.DAL;
using API.DAL.Repository;
using API.Modules.AccountsModule.Models;
using API.Modules.AccountsModule.Ports;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.AccountsModule.Adapters;

public class AccountsRepository : CRURepository<AccountEntity>, IAccountsRepository
{
    public AccountsRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    public async Task<AccountEntity?> GetByLoginAsync(string login)
    {
        return await Set.FirstOrDefaultAsync(account => account.Login == login);
    }
}