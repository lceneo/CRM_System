﻿using API.DAL.Repository;
using API.Modules.AccountsModule.Entities;

namespace API.Modules.AccountsModule.Ports;

public interface IAccountsRepository : ICRURepository<AccountEntity>
{
    public Task<AccountEntity?> GetByLoginAsync(string login);
}