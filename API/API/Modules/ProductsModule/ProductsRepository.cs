using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ProductsModule.Requests;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.ProductsModule;

public interface IProductsRepository : ICRUDRepository<ProductEntity>
{
    Task<SearchResponseBaseDTO<ProductEntity>> Search(SearchProductsRequest request, bool asNoTracking = true);
    Task<ProductEntity?> GetByIdAsync(Guid id, bool asNoTracking = true);
}

public class ProductsRepository : CRUDRepository<ProductEntity>, IProductsRepository
{
    public ProductsRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    private IQueryable<ProductEntity> IncludedSet => Set
        .Include(e => e.Tasks)
        .AsQueryable();

    public async Task<ProductEntity?> GetByIdAsync(Guid id)
        => await GetById(id, IncludedSet);
    
    public async Task<ProductEntity?> GetByIdAsync(Guid id, bool asNoTracking = true)
        => await GetById(id, IncludedSet, asNoTracking);

    public async Task<SearchResponseBaseDTO<ProductEntity>> Search(SearchProductsRequest request, bool asNoTracking = true)
    {
        var query = IncludedSet;
        if (asNoTracking)
            query = query.AsNoTracking();

        if (request.Ids != null)
            query = query.Where(e => request.Ids.Contains(e.Id));
        if (request.TaskIds != null)
            query = query.Where(e => e.Tasks.Any(t => request.TaskIds.Contains(t.Id)));
        
        if (request.PriceEq != null)
            query = query.Where(e => request.PriceEq == e.Price);
        if (request.PriceHigher != null)
            query = query.Where(e => e.Price > request.PriceHigher);
        if (request.PriceLower != null)
            query = query.Where(e => e.Price < request.PriceLower);
        
        if (request.Description != null)
            query = query.Where(e => e.Description.Contains(request.Description));

        var res = await query.ToListAsync();
        return new SearchResponseBaseDTO<ProductEntity>
        {
            TotalCount = res.Count,
            Items = res
        };
    }
}