using API.Infrastructure;

namespace API.Modules.ChatsModule;

public class ChatsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services) => services;

    public void ConfigureHubs(WebApplication app)
    {
        app.MapHub<ChatsHub>(ChatsHub.Route);
    }
}