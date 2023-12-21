using API.Infrastructure;

namespace API.Modules.LogsModule;

public interface ILog
{
    Task Info(IFormattable formattable);
    Task Info(string str);
    Task Error(IFormattable formattable);
    Task Error(string str);
}

public class Log : ILog, IDisposable
{
    private DateTime Now => DateTime.Now.ToUniversalTime();
    private readonly StreamWriter writer;

    public Log()
    {
        var path = Config.PathToCurLog(Now);
        if (!File.Exists(path))
            File.Create(path).Dispose();
        
        var stream = new FileStream(path, FileMode.Append, FileAccess.Write, FileShare.Read);
        writer = new StreamWriter(stream);
    }

    public async Task Info(string str)
        => writer.WriteLineAsync($"{Now} [INFO] {str}");

    public async Task Error(string str)
        => writer.WriteLineAsync($"{Now} [ERROR] {str}");

    public async Task Error(IFormattable formattable) => await Error(formattable.ToString());
    public async Task Info(IFormattable formattable) => await Info(formattable.ToString());

    public void Dispose()
    {
        writer.Dispose();
    }
}