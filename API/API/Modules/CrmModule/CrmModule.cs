using API.Infrastructure;
using API.Modules.CrmModule.Comments;
using API.Modules.CrmModule.Crm;
using API.Modules.CrmModule.Tasks;

namespace API.Modules.CrmModule;

public class CrmModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<ITaskCommentsRepository, TaskCommentsRepository>();
        services.AddScoped<ITasksCommentsService, TasksCommentsService>();
        services.AddAutoMapper(typeof(TaskCommentsMapping));
        services.AddScoped<ITasksRepository, TasksRepository>();
        services.AddScoped<ITasksService, TasksService>();
        services.AddAutoMapper(typeof(TasksMapping));
        services.AddScoped<ICrmService, CrmService>();

        services.AddScoped<ICrmHubNotifier, CrmHubNotifier>();
        services.AddSingleton<CrmHubConnectionsProvider>();
        
        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
        app.MapHub<CrmHub>(CrmHub.Route);
    }
}