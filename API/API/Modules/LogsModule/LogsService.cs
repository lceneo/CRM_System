using API.Extensions;
using API.Infrastructure;

namespace API.Modules.LogsModule;

public interface ILogsService
{
    public Result<string> GetLogs(DateOnly date);
}

public class LogsService : ILogsService
{
    public Result<string> GetLogs(DateOnly date)
    {
        var pathToLog = Config.PathToCurLog(date);
        if (!File.Exists(pathToLog))
            return Result.NotFound<string>("Логов за эту дату не найдено");
        
        using var stream = File.Open(pathToLog, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        return Result.Ok(stream.ReadAll());
    }
}