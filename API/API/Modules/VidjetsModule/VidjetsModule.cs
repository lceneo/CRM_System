using API.Infrastructure;

namespace API.Modules.VidjetsModule;

public class VidjetsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        

        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}