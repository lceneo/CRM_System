namespace API.Infrastructure;

public interface IModule
{
    IServiceCollection RegisterModule(IServiceCollection services);
    void ConfigureHubs(WebApplication app);
}

public static class ModuleExtensions
{
    private static List<IModule> modules;
    private static List<IModule> Modules => modules ??= DiscoverModules().ToList(); 

    public static IServiceCollection RegisterModules(this IServiceCollection services)
    {
        foreach (var module in Modules)
        {
            module.RegisterModule(services);
        }

        return services;
    }

    public static void ConfigureHubs(this WebApplication app)
    {
        foreach (var module in Modules)
        {
            module.ConfigureHubs(app);
        }
    }

    private static IEnumerable<IModule> DiscoverModules()
    {
        return typeof(IModule).Assembly
            .GetTypes()
            .Where(p => p.IsClass && p.IsAssignableTo(typeof(IModule)))
            .Select(Activator.CreateInstance)
            .Cast<IModule>();
    }
}