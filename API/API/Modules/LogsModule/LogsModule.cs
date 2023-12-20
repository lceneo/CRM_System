using API.Infrastructure;

namespace API.Modules.LogsModule;

public class LogsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<ILog, Log>();
        services.AddScoped<ILogsService, LogsService>();
        
        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}