using API.Infrastructure;
using API.Modules.ChatsModule.Ports;
using API.Modules.LogsModule;
using API.Modules.ProfilesModule.Ports;
using API.Modules.RatingModule.Entities;
using API.Modules.RatingModule.Models;
using API.Modules.RatingModule.Ports;
using AutoMapper;

namespace API.Modules.RatingModule.Adapters;

public class RatingService : IRatingService
{
    private readonly IProfilesRepository profilesRepository;
    private readonly IRatingRepository ratingRepository;
    private readonly IChatsRepository chatsRepository;
    private readonly ILog log;
    private readonly IMapper mapper;

    public RatingService(
        IRatingRepository ratingRepository,
        IProfilesRepository profilesRepository,
        IChatsRepository chatsRepository,
        ILog log,
        IMapper mapper)
    {
        this.ratingRepository = ratingRepository;
        this.profilesRepository = profilesRepository;
        this.chatsRepository = chatsRepository;
        this.log = log;
        this.mapper = mapper;
    }

    public async Task<Result<bool>> Rate(RateManagerApiModel model)
    {
        var manager = await profilesRepository.GetByIdAsync(model.ManagerId);
        if (manager == null)
            return Result.BadRequest<bool>("Такого менеджера не существует");
        var chat = await chatsRepository.GetByIdAsync(model.ChatId);
        if (chat == null)
            return Result.BadRequest<bool>("Такого чата не существует");

        var rate = new RatingEntity
        {
            Manager = manager,
            Chat = chat,
            Comment = model.Comment,
            Score = model.Score,
        };
        await ratingRepository.CreateAsync(rate);
        await log.Info($@"Comment to manager: {model.ManagerId} in chat: {chat.Id}");
        return Result.Ok(true);
    }

    public async Task<Result<IEnumerable<RatingStatisticDTO>>> GetStatistics(RatingStatReq searchReq)
    {
        var result = new List<RatingStatisticDTO>();
        foreach (var managerId in searchReq.ManagersIds)
        {
            var totalScore = 0f;
            var totalCount = 0;
            var rates = ratingRepository.GetByManagerAsync(managerId);
            foreach (var rate in rates)
            {
                totalScore += rate.Score;
                totalCount++;
            }
            
            result.Add(new RatingStatisticDTO
            {
                ManagerId = managerId,
                AverageScore = totalScore / Math.Max(totalCount, 1),
                TotalCount = totalCount,
            });
        }

        return Result.Ok<IEnumerable<RatingStatisticDTO>>(result);
    }

    public async Task<Result<IEnumerable<RatingOutDTO>>> GetRatesByManager(Guid managerId)
    {
        var rates = ratingRepository.GetByManagerAsync(managerId);
        return Result.Ok(mapper.Map<IEnumerable<RatingOutDTO>>(rates));
    }
}