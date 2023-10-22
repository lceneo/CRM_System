using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.DAL;

public class CRURepository<TEntity> : Repository<TEntity>, ICRURepository<TEntity>
    where TEntity : class, IEntity
{
    protected readonly IMapper mapper;

    public CRURepository(DataContext dataContext, IMapper mapper) : base(dataContext)
    {
        this.mapper = mapper;
    }

    public async Task<Guid> CreateAsync(TEntity entity)
    {
        await Set.AddAsync(entity);
        await SaveChangesAsync();

        return entity.Id;
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

    public async Task<(Guid Id, bool IsCreated)> CreateOrUpdateAsync(TEntity entity)
    {
        var isCreated = false;
        var cur = await Set.FindAsync(entity);
        if (cur == null)
        {
            await Set.AddAsync(entity);
            isCreated = true;
        }
        else
        {
            mapper.Map(entity, cur);
        }

        await SaveChangesAsync();
        
        return (entity.Id, isCreated);
    }
}