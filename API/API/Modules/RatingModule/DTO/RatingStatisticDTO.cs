using API.Modules.ProfilesModule.DTO;

namespace API.Modules.RatingModule.Entities;

public class RatingStatisticDTO
{
    public Guid ManagerId { get; set; }
    public float AverageScore { get; set; }
    public int TotalCount { get; set; }
}