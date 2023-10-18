using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.DAL;

public class CRURepository<TEntity> : Repository<TEntity>, ICRUREpository<TEntity>
    where TEntity : class, IEntity
{
    protected readonly IMapper mapper;

    public CRURepository(DataContext dataContext, IMapper mapper) : base(dataContext)
    {
        this.mapper = mapper;
    }

    public async Task CreateAsync(TEntity tEntity)
    {
        await Set.AddAsync(tEntity);
        await SaveChangesAsync();
    }

    public async Task<IEnumerable<TEntity>> GetEnumerable(int take = Int32.MaxValue, int skip = 0)
    {
        return await Set
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<TEntity?> GetByIdAsync(Guid id) 
        => await Set.FindAsync(id);

    public async Task UpdateAsync(TEntity updated)
    {
        var existed = await Set.FindAsync(updated.Id);
        if (existed == null)
            return;

        mapper.Map(updated, existed);
        await SaveChangesAsync();
    }
}