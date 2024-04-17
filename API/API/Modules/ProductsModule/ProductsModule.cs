using API.Infrastructure;

namespace API.Modules.ProductsModule;

public class ProductsModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<IProductsRepository, ProductsRepository>();
        services.AddScoped<IProductsService, ProductsService>();
        services.AddAutoMapper(typeof(ProductsMapping));

        return services;
    }

    public void ConfigureHubs(WebApplication app)
    {
    }
}