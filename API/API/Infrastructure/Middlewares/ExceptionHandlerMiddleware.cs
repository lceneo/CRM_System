using System.Net;
using System.Text.Json;
using API.Modules.LogsModule;

namespace API.Infrastructure.Middlewares;

public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate next;
    
    public ExceptionHandlerMiddleware(
        RequestDelegate next)    
    {    
        this.next = next;    
    }    
    
    public async Task Invoke(HttpContext context, ILog log)    
    {    
        try    
        {    
            await next.Invoke(context);    
        }    
        catch (Exception ex)
        {    
            await HandleExceptionMessageAsync(context, ex, log).ConfigureAwait(false);  
        }
    }
    
    private Task HandleExceptionMessageAsync(HttpContext context, Exception exception, ILog log)  
    {  
        context.Response.ContentType = "application/json";  
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        log.Error($"Route: {context.Request.Path} Exception: {exception.Message}");
        return context.Response.WriteAsync(JsonSerializer.Serialize(exception.Message));  
    } 
    
    /*public static void Register(WebApplication app)
    {
        app.UseExceptionHandler(exceptionHandlerApp =>
        {
            exceptionHandlerApp.Run(async context =>
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                // using static System.Net.Mime.MediaTypeNames;
                context.Response.ContentType = MediaTypeNames.Text.Plain;

                await context.Response.WriteAsync("An exception was thrown.");

                var exceptionHandlerPathFeature =
                    context.Features.Get<>();

                if (exceptionHandlerPathFeature?.Error is FileNotFoundException)
                {
                    await context.Response.WriteAsync(" The file was not found.");
                }

                if (exceptionHandlerPathFeature?.Path == "/")
                {
                    await context.Response.WriteAsync(" Page: Home.");
                }
            });
        });
    }*/
}