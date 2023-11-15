namespace API.Infrastructure.BaseApiDTOs;

public class SearchRequestBaseDTO
{
    public HashSet<Guid>? Ids { get; set; }
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 100;
}