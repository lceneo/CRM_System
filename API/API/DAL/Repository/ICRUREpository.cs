using API.Infrastructure.BaseApiDTOs;

namespace API.DAL.Repository;

public interface ICRURepository<TEntity>
    where TEntity : class, IEntity
{
    public Task<Guid> CreateAsync(TEntity entity);
    public Task<IEnumerable<TEntity>> GetEnumerable(int take = Int32.MaxValue, int skip = 0);
    [Obsolete("use without tracking to avoid bugs in update")]
    public Task<TEntity?> GetByIdAsync(Guid id);
    public Task<TEntity?> GetById(Guid id, IQueryable<TEntity>? includedSet, bool asNoTracking = true);
    public Task<List<TEntity>> GetByIdsAsync(IEnumerable<Guid> ids);
    public Task UpdateAsync(TEntity updated);
    public Task<CreateResponse<Guid>> CreateOrUpdateAsync(TEntity entity);
    public Task<CreateResponse<Guid>> CreateOrUpdateAsync(TEntity entity, IQueryable<TEntity>? includedSet);
    public Task SaveChangesAsync();
}