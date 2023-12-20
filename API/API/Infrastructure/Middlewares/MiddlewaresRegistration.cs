namespace API.Infrastructure.Middlewares;

public static class MiddlewaresRegistration
{
    public static void RegisterMiddlewares(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
            app.UseMiddleware<ExceptionHandlerMiddleware>();
    }
}