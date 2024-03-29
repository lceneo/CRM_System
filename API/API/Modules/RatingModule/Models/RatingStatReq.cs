namespace API.Modules.RatingModule.Models;

public class RatingStatReq
{
    public IEnumerable<Guid> ManagersIds { get; set; }
}