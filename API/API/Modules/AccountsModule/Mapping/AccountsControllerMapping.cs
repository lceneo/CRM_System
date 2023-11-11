using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Entities;
using API.Modules.AccountsModule.Models;
using AutoMapper;

namespace API.Modules.AccountsModule.Mapping;

public class AccountsControllerMapping : Profile
{
    public AccountsControllerMapping()
    {
        CreateMap<RegisterClientRequest, RegisterByAdminRequest>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(_ => AccountRole.Client));
        CreateMap<ClaimsResponse, AccountsResponse>();
    }
}