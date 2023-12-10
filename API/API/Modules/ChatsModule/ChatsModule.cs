using API.Infrastructure;
using API.Modules.ChatsModule.Adapters;
using API.Modules.ChatsModule.Mapping;
using API.Modules.ChatsModule.Ports;

namespace API.Modules.ChatsModule;

public class ChatsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<IMessagesRepository, MessagesRepository>();
        services.AddScoped<IChatsRepository, ChatsRepository>();
        services.AddScoped<IChatsService, ChatsService>();

        services.AddAutoMapper(typeof(ChatsMapping));
        services.AddAutoMapper(typeof(MessagesMapping));

        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
        app.MapHub<ChatsHub>(ChatsHub.Route);
    }
}