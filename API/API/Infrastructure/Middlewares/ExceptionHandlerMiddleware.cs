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

        log.Error($"Route: {context.Request.Path} StackTrace: {exception.StackTrace} StackTrace: {exception.StackTrace}");
        return context.Response.WriteAsync(JsonSerializer.Serialize(exception.Message));  
    }
}