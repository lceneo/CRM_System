using API.Modules.StatisticsModule.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.StatisticsModule;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService statisticsService;

    public StatisticsController(IStatisticsService statisticsService)
    {
        this.statisticsService = statisticsService;
    }

    /// <summary>
    /// Среднее время ответа по менеджерам за период
    /// </summary>
    /// <remarks>
    /// Если null, значит нет инфы о менеджере
    /// </remarks>
    /// <returns></returns>
    [HttpPost("AverageAnswerTime")]
    public async Task<ActionResult<IEnumerable<AverageAnswerTimeResponse>>> AverageAnswerTime(
        [FromBody] PeriodicStatisticRequest request)
    {
        var result = await statisticsService.AverageAnswerTime(request);
        return result.ActionResult;
    }

    /// <summary>
    /// Среднее время первого ответа на сообщение
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    [HttpPost("FirstMessageAverageAnswerTime")]
    public async Task<ActionResult<IEnumerable<AverageAnswerTimeResponse>>> FirstMessageAverageAnswerTime(
        [FromBody] PeriodicStatisticRequest request)
    {
        var result = await statisticsService.FirstMessageAverageAnswerTime(request);
        return result.ActionResult;
    }

    /// <summary>
    /// Статистика активности менеджера в разрезе каждого дня. Показывается стата за каждый чат по дням + общее кол-во сообщений за период
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    [HttpPost("ActivityStats")]
    public async Task<ActionResult<IEnumerable<ActivityStat>>> ActivityStats(
        [FromBody] PeriodicStatisticRequest request)
    {
        var result = statisticsService.ActivityStat(request);
        return result.ActionResult;
    } 
}