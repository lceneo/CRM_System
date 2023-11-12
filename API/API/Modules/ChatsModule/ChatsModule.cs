using API.Infrastructure;
using API.Modules.ChatsModule.Adapters;
using API.Modules.ChatsModule.Entities;
using API.Modules.ChatsModule.Ports;

namespace API.Modules.ChatsModule;

public class ChatsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<IMessagesRepository, MessagesRepository>();
        services.AddScoped<IChatsRepository, ChatsRepository>();
        services.AddScoped<IChatsService, ChatsService>();

        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
        app.MapHub<ChatsHub>(ChatsHub.Route);
    }
}