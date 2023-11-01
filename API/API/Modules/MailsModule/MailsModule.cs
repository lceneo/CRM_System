using API.Infrastructure;
using API.Modules.MailsModule.Adapters;
using API.Modules.MailsModule.Ports;

namespace API.Modules.MailsModule;

public class MailsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<IMailMessagesService, MailMessagesService>();
        services.AddScoped<IMailMessagesRepository, MailMessagesRepository>();
        services.AddScoped<ILoggedSmtpClient, LoggedSmtpClient>();

        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}