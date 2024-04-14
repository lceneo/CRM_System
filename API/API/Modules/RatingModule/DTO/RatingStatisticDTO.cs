namespace API.Modules.RatingModule.DTO;

public class RatingStatisticDTO
{
    public Guid ManagerId { get; set; }
    public float AverageScore { get; set; }
    public int TotalCount { get; set; }
}