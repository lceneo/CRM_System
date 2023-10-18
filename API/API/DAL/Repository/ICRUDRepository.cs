namespace API.DAL;

public interface ICRUDRepository<TEntity> : ICRUREpository<TEntity>
    where TEntity : class, IEntity
{
    public Task DeleteAsync(Guid id);
}