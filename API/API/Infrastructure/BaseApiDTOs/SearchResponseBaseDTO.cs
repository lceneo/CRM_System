namespace API.Infrastructure.BaseApiDTOs;

public class SearchResponseBaseDTO<T>
{
    public long TotalCount { get; set; }
    public List<T> Items { get; set; }
}