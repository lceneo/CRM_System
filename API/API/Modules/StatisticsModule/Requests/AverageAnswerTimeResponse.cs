namespace API.Modules.StatisticsModule.Requests;

public class AverageAnswerTimeResponse
{
    public Guid ManagerId { get; set; }
    /// <summary>
    /// Если поле null, значит о менеджере нет инфы
    /// </summary>
    public TimeSpan? AverageTime { get; set; }
}