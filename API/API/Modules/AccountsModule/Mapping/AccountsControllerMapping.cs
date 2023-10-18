using API.Modules.AccountsModule.Models;
using AutoMapper;

namespace API.Modules.AccountsModule.Mapping;

public class AccountsControllerMapping : Profile
{
    public AccountsControllerMapping()
    {
        CreateMap<ClaimsResponse, AccountsResponse>();
    }
}