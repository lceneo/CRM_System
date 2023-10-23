namespace API.DAL;

public interface ICRUDRepository<TEntity> : ICRURepository<TEntity>
    where TEntity : class, IEntity
{
    public Task DeleteAsync(Guid id);
}