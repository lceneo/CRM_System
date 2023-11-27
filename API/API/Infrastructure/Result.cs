using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace API.Infrastructure;

public struct Result<T>
{
    public Result(string error, HttpStatusCode statusCode, T value = default(T))
    {
        Error = error;
        StatusCode = statusCode;
        Value = value;
    }
    public string Error { get; }
    public HttpStatusCode StatusCode { get; }
    public T Value { get; }
    public bool IsSuccess => Error == null;

    private object? SpecificResponse = null;
    
    public void Specificate<T2>(Func<T, T2> selector)
    {
        SpecificResponse = selector(Value);
    }
    
    public ActionResult ActionResult
    {
        get
        {
            return StatusCode switch
            {
                HttpStatusCode.OK => new OkObjectResult(SpecificResponse ?? Value),
                HttpStatusCode.NoContent => new NoContentResult(),
                HttpStatusCode.BadRequest => new BadRequestObjectResult(Error),
                HttpStatusCode.NotFound => new NotFoundObjectResult(Error),
                _ => throw new ArgumentException($"Result does not support {StatusCode}")
            };
        }
    }
}

public static class Result
{
    public static Result<T> Ok<T>(T value)
    {
        return new Result<T>(null, HttpStatusCode.OK,  value);
    }
    
    public static Result<T> NoContent<T>()
    {
        return new Result<T>(null, HttpStatusCode.NoContent);
    }

    public static Result<T> BadRequest<T>(string e)
    {
        return new Result<T>(e, HttpStatusCode.BadRequest);
    }
    
    public static Result<T> NotFound<T>(string e)
    {
        return new Result<T>(e, HttpStatusCode.NotFound);
    }
}