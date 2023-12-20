namespace API.Infrastructure;

public class Config
{
    public const string MailBoxLogin = @"chernorusy@mail.ru";
    public const string MailBoxPassword = @"KGw9Q2bmFZpyptJ4xfKZ";
    public const string Host = "localhost:3000";
    public const string JwtSecurityKey = "Token with 16 ch";
    public static string PathToStatic = Directory.GetCurrentDirectory() + @"/Static";
    public static string PathToLogs = Directory.GetCurrentDirectory() + @"/Logs";
    public const string HubsPolicyName = "HubsPolicy";

    public static string PathToCurLog(DateOnly date)
        => PathToLogs + @$"/{date.ToString("dd-MM-yyyy")}";

    public static string PathToCurLog(DateTime dateTime)
        => PathToCurLog(DateOnly.FromDateTime(dateTime));
}