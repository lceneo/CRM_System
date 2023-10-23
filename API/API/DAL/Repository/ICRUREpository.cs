namespace API.DAL;

public interface ICRURepository<TEntity>
    where TEntity : class, IEntity
{
    public Task<Guid> CreateAsync(TEntity entity);
    public Task<IEnumerable<TEntity>> GetEnumerable(int take = Int32.MaxValue, int skip = 0);
    public Task<TEntity?> GetByIdAsync(Guid id);
    public Task UpdateAsync(TEntity updated);
    public Task<(Guid Id, bool IsCreated)> CreateOrUpdateAsync(TEntity entity);
}