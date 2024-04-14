using API.Infrastructure.BaseApiDTOs;
using API.Modules.ProductsModule.DTO;
using API.Modules.ProductsModule.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.ProductsModule;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductsService productsService;

    public ProductsController(IProductsService productsService)
    {
        this.productsService = productsService;
    }

    /// <summary>
    /// Добавить/изменить продукт
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    [HttpPost]
    public async Task<ActionResult<CreateResponse<Guid>>> CreateOrUpdate(CreateOrUpdateProductRequest request)
    {
        var result = await productsService.CreateOrUpdate(request);
        return result.ActionResult;
    }

    /// <summary>
    /// Поиск по продуктам
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    [HttpPost("Search")]
    public async Task<ActionResult<SearchResponseBaseDTO<ProductFullDTO>>> Search(SearchProductsRequest request)
    {
        var result = await productsService.Search(request);
        return result.ActionResult;
    }

    /// <summary>
    /// Удалить продукт
    /// </summary>
    /// <remarks>
    /// Удалить можно только продукт у которого нет связанных задач 
    /// </remarks>
    /// <param name="productId"></param>
    /// <returns></returns>
    [HttpDelete("{productId:Guid}")]
    public async Task<ActionResult<bool>> Delete([FromRoute]Guid productId)
    {
        var result = await productsService.Delete(productId);
        return result.ActionResult;
    }
}