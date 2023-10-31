using API.Infrastructure;
using API.Modules.AccountsModule.Adapters;
using API.Modules.AccountsModule.Mapping;
using API.Modules.AccountsModule.Ports;

namespace API.Modules.AccountsModule;

public class AccountsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddAutoMapper(typeof(AccountsControllerMapping));
        services.AddAutoMapper(typeof(AccountsServiceMapping));
        services.AddScoped<IAccountsRepository, AccountsRepository>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IAccountsService, AccountsService>();

        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
        return;
    }
}