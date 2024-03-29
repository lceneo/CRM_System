namespace API.Modules.RatingModule.Models;

public class RateManagerApiModel
{
    public Guid ManagerId { get; set; }
    public Guid ChatId { get; set; }
    public string Comment { get; set; }
    public int Score { get; set; }
}