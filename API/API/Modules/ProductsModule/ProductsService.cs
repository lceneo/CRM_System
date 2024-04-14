using System.Text.Json;
using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.LogsModule;
using API.Modules.ProductsModule.DTO;
using API.Modules.ProductsModule.Requests;
using AutoMapper;

namespace API.Modules.ProductsModule;

public interface IProductsService
{
    Task<Result<CreateResponse<Guid>>> CreateOrUpdate(CreateOrUpdateProductRequest request);
    Task<Result<SearchResponseBaseDTO<ProductFullDTO>>> Search(SearchProductsRequest request);
    Task<Result<bool>> Delete(Guid productId);
}

public class ProductsService : IProductsService
{
    private readonly ILog log;
    private readonly IMapper mapper;
    private readonly IProductsRepository productsRepository;

    public ProductsService(ILog log, IMapper mapper, IProductsRepository productsRepository)
    {
        this.log = log;
        this.mapper = mapper;
        this.productsRepository = productsRepository;
    }

    public async Task<Result<CreateResponse<Guid>>> CreateOrUpdate(CreateOrUpdateProductRequest request)
    {
        ProductEntity? product = null;
        if (request.Id != null)
        {
            product = await productsRepository.GetByIdAsync(request.Id.Value);
            if (product == null)
                return Result.NotFound<CreateResponse<Guid>>("Такого продукта не существует");
        }
        else
        {
            product = new ProductEntity();
        }

        mapper.Map(request, product);
        var result = await productsRepository.CreateOrUpdateAsync(product);
        await log.Info($"POST Products isCreated: {result.IsCreated} task: {result.Id}");
        return Result.Ok(new CreateResponse<Guid>
        {
            Id = result.Id,
            IsCreated = result.IsCreated,
        });
    }

    public async Task<Result<SearchResponseBaseDTO<ProductFullDTO>>> Search(SearchProductsRequest request)
    {
        var result = await productsRepository.Search(request);

        await log.Info($"Found {result.TotalCount} products by request: {JsonSerializer.Serialize(request)}");
        return Result.Ok(new SearchResponseBaseDTO<ProductFullDTO>
        {
            Items = mapper.Map<List<ProductFullDTO>>(result.Items),
            TotalCount = result.TotalCount,
        });
    }

    public async Task<Result<bool>> Delete(Guid productId)
    {
        var product = await productsRepository.GetByIdAsync(productId);
        if (product.Tasks.Any())
            return Result.BadRequest<bool>("Нельзя удалить продукт пока у него есть связанные задачи");
        
        await productsRepository.DeleteAsync(productId);
        return Result.Ok(true);
    }
}