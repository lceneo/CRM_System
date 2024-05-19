using API.Infrastructure;
using API.Modules.ClientsModule.DTO;

namespace API.Modules.ClientsModule;

public class ClientsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<IClientsRepository, ClientsRepository>();
        services.AddScoped<IClientsService, ClientsService>();
        services.AddAutoMapper(typeof(ClientsMapping));
        
        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}