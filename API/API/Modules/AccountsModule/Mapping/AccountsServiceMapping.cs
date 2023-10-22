using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Models;
using API.Modules.AccountsModule.Ports;
using AutoMapper;

namespace API.Modules.AccountsModule.Mapping;

public class AccountsServiceMapping : Profile
{
    public AccountsServiceMapping()
    {
        CreateMap<RegisterRequest, AccountEntity>();

        CreateMap<RegisterRequest, LoginRequest>();

    }
    
    private class PasswordConverter : IValueConverter<string, string>
    {
        private readonly IPasswordHasher passwordHasher;

        public PasswordConverter(IPasswordHasher passwordHasher)
        {
            this.passwordHasher = passwordHasher;
        }
        
        public string Convert(string sourceMember, ResolutionContext context)
        {
            return passwordHasher.CalculateHash(sourceMember);
        }
    }
}