namespace API.Modules.ProductsModule.DTO;

public class ProductFullDTO
{
    public Guid Id { get; set; }
    public int Price { get; set; }
    public string Description { get; set; }
    public HashSet<Guid> TaskIds { get; set; }
}