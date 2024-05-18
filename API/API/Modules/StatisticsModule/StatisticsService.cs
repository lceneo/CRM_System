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
    Task<Result<List<AverageAnswerTimeResponse>>> AverageAnswerTime(PeriodicStatisticRequest request);
    Task<Result<List<AverageAnswerTimeResponse>>> FirstMessageAverageAnswerTime(PeriodicStatisticRequest request);
    Result<List<ActivityStat>> ActivityStat(PeriodicStatisticRequest request);
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

    public async Task<Result<List<AverageAnswerTimeResponse>>> AverageAnswerTime(PeriodicStatisticRequest request)
    {
        var statFunc = GetFunc((messagesByChats) => messagesByChats
            .Select(messages => GetAverage(messages))
            .Average());
        var result = await CountStat(request, statFunc);

        return Result.Ok(result);
    }

    public async Task<Result<List<AverageAnswerTimeResponse>>> FirstMessageAverageAnswerTime(PeriodicStatisticRequest request)
    {
        var statFunc = GetFunc((messagesByChats) => messagesByChats
            .Select(messages => GetAverage(messages, (message) => message.Type == MessageType.System 
                                                                  && message.Message == "Чат архивирован менеджером"))
            .Average());
        var result = await CountStat(request, statFunc);

        return Result.Ok(result);
    }

    public Result<List<ActivityStat>> ActivityStat(PeriodicStatisticRequest request)
    {
        var result = new List<ActivityStat>();
        foreach (var managerId in request.ManagerIds)
        {
            var searchReq = new MessagesSearchRequest
            {
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Sender = managerId,
            };
            var messagesSearch = messagesRepository.Search(searchReq);
            var messages = messagesSearch.Items;

            result.Add(new ActivityStat
            {
                ManagerId = managerId,
                DailyStat = messages.GroupBy(m => m.DateTime.Date).Select(messagesByDate => new DailyStat
                {
                    Date = messagesByDate.Key,
                    DialogsCount = messagesByDate.GroupBy(m => m.Chat.Id).Count(),
                    MessagesCount = messagesByDate.Count()
                }).ToArray(),
                TotalMessagesCount = messagesSearch.TotalCount,
            });
        }

        return Result.Ok(result);
    }

    private async Task<List<AverageAnswerTimeResponse>> CountStat(
        PeriodicStatisticRequest request,
        Func<IEnumerable<IEnumerable<MessageEntity>>, TimeSpan?> statFunc)
    {
        var searchReq = new MessagesSearchRequest
        {
            StartTime = request.StartTime,
            EndTime = request.EndTime,
        };
        var result = new List<AverageAnswerTimeResponse>();
        foreach (var managerId in request.ManagerIds)
        {
            var chats = await chatsRepository.GetAllByUser(managerId);
            var messages = chats.Select(chat => messagesRepository.Search(chat.Id, searchReq))
                .Select(messagesSearchRes => messagesSearchRes.Items);
            var stat = statFunc(messages);
            result.Add(new AverageAnswerTimeResponse
            {
                ManagerId = managerId,
                AverageTime = stat,
            });
        }

        return result;
    }

    private TimeSpan? GetAverage(IEnumerable<MessageEntity> messages, Func<MessageEntity, bool>? isCustomReset = null)
    {
        var (totalTime, totalCount) = (new TimeSpan(), 0);
        DateTime? clientMessageTime = null;
        foreach (var message in messages.OrderBy(m => m.DateTime))
        {
            if (isCustomReset != null && isCustomReset(message))
            {
                clientMessageTime = null;
                continue;
            }
            if (message.Type == MessageType.System)
                continue;
            if (clientMessageTime == null && (message.Sender.Account.Role == AccountRole.Client 
                                              || message.Sender.Account.Role == AccountRole.Buyer))
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
    
    private Func<IEnumerable<IEnumerable<MessageEntity>>, TimeSpan?> GetFunc(
        Func<IEnumerable<IEnumerable<MessageEntity>>, TimeSpan?> func) => func;
}