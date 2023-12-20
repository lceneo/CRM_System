using Microsoft.AspNetCore.Mvc;

namespace API.Modules.LogsModule;

[Route("api/[controller]")]
[ApiController]
public class LogsController : ControllerBase
{
    private readonly ILogsService logsService;
    
    public LogsController(ILogsService logsService)
    {
        this.logsService = logsService;
    }
    
    [HttpGet]
    public ActionResult GetLogs()
    {
        return logsService.GetLogs(DateOnly.FromDateTime(DateTime.Now.ToUniversalTime()))
            .ActionResult;
    }

    [HttpGet(@"{date:regex([[\d*]])}")]
    public ActionResult GetLogs([FromRoute] string date)
    {
        if (!DateOnly.TryParse(date, out var dateOnly))
            return BadRequest("Неправильный формат в Route. Должен быть yyyy-MM-dd");
        
        return logsService.GetLogs(dateOnly).ActionResult;
    }
}