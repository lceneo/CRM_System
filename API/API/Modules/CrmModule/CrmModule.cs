using API.Infrastructure;
using API.Modules.CrmModule.Adapters;
using API.Modules.CrmModule.Mapping;
using API.Modules.CrmModule.Ports;

namespace API.Modules.CrmModule;

public class CrmModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<ITasksRepository, TasksRepository>();
        services.AddScoped<ITasksService, TasksService>();
        services.AddScoped<ICrmService, CrmService>();
        services.AddAutoMapper(typeof(TasksMapping));
        
        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}