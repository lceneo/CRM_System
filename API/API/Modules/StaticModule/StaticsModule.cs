using API.Infrastructure;
using API.Modules.StaticModule.Adapters;
using API.Modules.StaticModule.Ports;

namespace API.Modules.StaticModule;

public class StaticsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<IStaticsRepository, StaticsRepository>();
        services.AddScoped<IStaticsService, StaticsService>();

        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}