namespace API.Infrastructure;

public class Config
{
    public string MailBoxLogin { get; }
    public string MailBoxPassword { get; }
    public string Host { get; }

    public Config(WebApplicationBuilder builder)
    {
        MailBoxLogin = @"chernorusy@mail.ru";
        MailBoxPassword = @"KGw9Q2bmFZpyptJ4xfKZ";
        Host = "localhost";
    }
}