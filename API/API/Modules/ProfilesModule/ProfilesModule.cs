using API.Infrastructure;
using API.Modules.ProfilesModule.Adapters;
using API.Modules.ProfilesModule.Mapping;
using API.Modules.ProfilesModule.Ports;

namespace API.Modules.ProfilesModule;

public class ProfilesModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddAutoMapper(typeof(ProfilesMapping));
        services.AddScoped<IProfilesRepository, ProfilesRepository>();
        services.AddScoped<IProfilesService, ProfilesService>();
        
        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}