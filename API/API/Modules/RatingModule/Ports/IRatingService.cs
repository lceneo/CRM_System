using API.Infrastructure;
using API.Modules.RatingModule.Entities;
using API.Modules.RatingModule.Models;

namespace API.Modules.RatingModule.Ports;

public interface IRatingService
{
    public Task<Result<bool>> Rate(RateManagerApiModel model);
    public Task<Result<IEnumerable<RatingStatisticDTO>>> GetStatistics(RatingStatReq searchReq);
    public Task<Result<IEnumerable<RatingOutDTO>>> GetRatesByManager(Guid managerId);
}