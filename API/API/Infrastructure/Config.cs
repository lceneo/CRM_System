namespace API.Infrastructure;

public class Config
{
    public string Host { get; }
    public string MailBoxLogin { get; }
    public string MailBoxPassword { get; }

    public Config(WebApplicationBuilder builder)
    {
        Host = Environment.GetEnvironmentVariable("HOST");
        MailBoxLogin = Environment.GetEnvironmentVariable("MAILBOX_LOGIN");
        MailBoxPassword = Environment.GetEnvironmentVariable("MAILBOX_PASSWORD");
    }
}