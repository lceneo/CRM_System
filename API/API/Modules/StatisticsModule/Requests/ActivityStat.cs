namespace API.Modules.StatisticsModule.Requests;

public class ActivityStat
{
    public Guid ManagerId { get; set; }
    public IEnumerable<DailyStat> DailyStat { get; set; }
    public long TotalMessagesCount { get; set; }
}

public class DailyStat
{
    public DateTime Date { get; set; }
    public int DialogsCount { get; set; }
    public int MessagesCount { get; set; }
}