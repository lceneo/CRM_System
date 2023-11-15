using Microsoft.EntityFrameworkCore;

namespace API.DAL.Repository;

public abstract class Repository<TEntity>
    where TEntity : class
{
    private readonly DataContext dataContext;

    protected Repository(DataContext dataContext)
    {
        this.dataContext = dataContext;
    }

    protected DbSet<TEntity> Set => dataContext.Set<TEntity>();

    public async Task SaveChangesAsync()
    {
        await dataContext.SaveChangesAsync();
    }
}