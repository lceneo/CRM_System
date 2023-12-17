namespace API.Infrastructure.BaseApiDTOs;

public class CreateResponse<TKey>
{
    public TKey Id { get; set; }
    public bool IsCreated { get; set; }
}