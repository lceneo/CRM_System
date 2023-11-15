using API.Infrastructure.BaseApiDTOs;

namespace API.DAL.Repository;

public interface ICRURepository<TEntity>
    where TEntity : class, IEntity
{
    public Task<Guid> CreateAsync(TEntity entity);
    public Task<IEnumerable<TEntity>> GetEnumerable(int take = Int32.MaxValue, int skip = 0);
    public Task<TEntity?> GetByIdAsync(Guid id);
    public Task<List<TEntity>> GetByIdsAsync(IEnumerable<Guid> ids);
    public Task UpdateAsync(TEntity updated);
    public Task<CreateResponse> CreateOrUpdateAsync(TEntity entity);
}