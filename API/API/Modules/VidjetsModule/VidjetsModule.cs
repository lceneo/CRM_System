using API.Infrastructure;
using API.Modules.VidjetsModule.Adapters;
using API.Modules.VidjetsModule.Mapping;
using API.Modules.VidjetsModule.Ports;

namespace API.Modules.VidjetsModule;

public class VidjetsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<IVidjetsRepository, VidjetsRepository>();
        services.AddScoped<IVidjetsService, VidjetsService>();
        services.AddAutoMapper(typeof(VidjetsMapping));

        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}