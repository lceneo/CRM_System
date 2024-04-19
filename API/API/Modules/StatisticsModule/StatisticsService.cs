using API.Extensions;
using API.Infrastructure;
using API.Modules.AccountsModule.Entities;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.Entities;
using API.Modules.ChatsModule.Ports;
using API.Modules.StatisticsModule.Requests;

namespace API.Modules.StatisticsModule;

public interface IStatisticsService
{
    Task<Result<List<AverageAnswerTimeResponse>>> AverageAnswerTime(AverageAnswerTimeRequest request);
}

public class StatisticsService : IStatisticsService
{
    private readonly IChatsRepository chatsRepository;
    private readonly IMessagesRepository messagesRepository;

    public StatisticsService(IMessagesRepository messagesRepository, IChatsRepository chatsRepository)
    {
        this.messagesRepository = messagesRepository;
        this.chatsRepository = chatsRepository;
    }

    public async Task<Result<List<AverageAnswerTimeResponse>>> AverageAnswerTime(AverageAnswerTimeRequest request)
    {
        var result = new List<AverageAnswerTimeResponse>();
        foreach (var managerId in request.ManagerIds)
        {
            var chats = await chatsRepository.GetAllByUser(managerId);
            var stat = chats.Select(chat => messagesRepository.Search(
                    chat.Id,
                    new MessagesSearchRequest
                    {
                        StartTime = request.StartTime,
                        EndTime = request.EndTime,
                    }))
                .Select(pack => pack.Items)
                .Select(GetAverage)
                .Average();
            result.Add(new AverageAnswerTimeResponse
            {
                ManagerId = managerId,
                AverageTime = stat,
            });
        }

        return Result.Ok(result);
    }

    private TimeSpan? GetAverage(IEnumerable<MessageEntity> messages)
    {
        var (totalTime, totalCount) = (new TimeSpan(), 0);
        DateTime? clientMessageTime = null;
        foreach (var message in messages.OrderBy(m => m.DateTime))
        {
            if (message.Type == MessageType.System)
                continue;
            if (clientMessageTime == null && message.Sender.Account.Role == AccountRole.Client)
                clientMessageTime = message.DateTime;
            else if (clientMessageTime != null && message.Sender.Account.Role == AccountRole.Manager)
            {
                totalCount++;
                totalTime += message.DateTime - clientMessageTime.Value;
                clientMessageTime = null;
            }
        }

        return totalTime.Ticks != 0
            ? totalTime / totalCount
            : null;
    }
}