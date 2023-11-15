namespace API.Infrastructure.BaseApiDTOs;

public class SearchResponseBaseDTO<T>
{
    public int TotalCount { get; set; }
    public List<T> Items { get; set; }
}