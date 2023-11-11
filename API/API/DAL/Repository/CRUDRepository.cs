using AutoMapper;

namespace API.DAL.Repository;

public class CRUDRepository<TEntity> : CRURepository<TEntity>, ICRUDRepository<TEntity>
    where TEntity : class, IEntity
{
    public CRUDRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    public async Task DeleteAsync(Guid id)
    {
        var existed = await Set.FindAsync(id);
        if (existed == null)
            return;

        Set.Remove(existed);
        await SaveChangesAsync();
    }
}