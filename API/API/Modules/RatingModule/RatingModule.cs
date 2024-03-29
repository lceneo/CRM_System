using API.Infrastructure;
using API.Modules.RatingModule.Adapters;
using API.Modules.RatingModule.Ports;

namespace API.Modules.RatingModule;

public class RatingModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<IRatingRepository, RatingRepository>();
        services.AddScoped<IRatingService, RatingService>();
        services.AddAutoMapper(typeof(RatingMapping));
        
        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}