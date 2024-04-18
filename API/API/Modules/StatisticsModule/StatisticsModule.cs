using API.Infrastructure;

namespace API.Modules.StatisticsModule;

public class StatisticsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<IStatisticsService, StatisticsService>();

        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}