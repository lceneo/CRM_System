namespace API.Modules.ProductsModule.Requests;

public class CreateOrUpdateProductRequest
{
    public Guid? Id { get; set; }
    public double? Price { get; set; }
    public string? Description { get; set; }
}