namespace API.Modules.StatisticsModule.Requests;

public class PeriodicStatisticRequest
{
    public HashSet<Guid> ManagerIds { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}