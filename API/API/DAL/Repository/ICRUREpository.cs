namespace API.DAL;

public interface ICRUREpository<TEntity>
    where TEntity : class, IEntity
{
    public Task CreateAsync(TEntity tEntity);
    public Task<IEnumerable<TEntity>> GetEnumerable(int take = Int32.MaxValue, int skip = 0);
    public Task<TEntity?> GetByIdAsync(Guid id);
    public Task UpdateAsync(TEntity updated);
}