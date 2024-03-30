using API.Extensions;
using API.Modules.LogsModule;
using API.Modules.RatingModule.Entities;
using API.Modules.RatingModule.Models;
using API.Modules.RatingModule.Ports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.RatingModule;

/// <summary>
/// Оценки по менеджерам
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class RatingController : ControllerBase
{
    private readonly IRatingService ratingService;
    private readonly ILog log;

    public RatingController(IRatingService ratingService, ILog log)
    {
        this.ratingService = ratingService;
        this.log = log;
    }

    /// <summary>
    /// Для ХАБА. Оценить менеджера в чате. 
    /// </summary>
    /// <remarks>
    /// Чтобы пользователь мог поставить оценку менеджеру
    /// </remarks>
    /// <param name="model"></param>
    /// <returns></returns>
    [HttpPost("")]
    public async Task<ActionResult> RateManager(RateManagerApiModel model)
    {
        var result = await ratingService.Rate(model);
        return result.ActionResult;
    }

    /// <summary>
    /// Список Оценок по Менеджеру
    /// </summary>
    /// <param name="managerId"></param>
    /// <returns></returns>
    [HttpGet("{managerId:Guid}")]
    public async Task<ActionResult<IEnumerable<RatingOutDTO>>> GetRatesByManager([FromRoute]Guid managerId)
    {
        var ratesResult = await ratingService.GetRatesByManager(managerId);
        if (!ratesResult.IsSuccess)
            return ratesResult.ActionResult;

        var rates = ratesResult.Value.ToArray();
        await log.Info($@"Found {rates.Length}");
        return Ok(rates);
    }

    /// <summary>
    /// Даёт статистику по менеджерам. 
    /// </summary>
    /// <remarks>
    /// Средняя оценка, Сколько всего оценок
    /// </remarks>
    /// <param name="searchReq"></param>
    /// <returns></returns>
    [HttpPost("Statistics")]
    public async Task<ActionResult<IEnumerable<RatingStatisticDTO>>> GetStatistics([FromBody] RatingStatReq searchReq)
    {
        var result = await ratingService.GetStatistics(searchReq);
        return result.ActionResult;
    }
}