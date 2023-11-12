using API.Infrastructure.BaseApiDTOs;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.DAL.Repository;

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

    public Task<List<TEntity>> GetByIdsAsync(IEnumerable<Guid> ids)
    {
        var hashSet = ids.ToHashSet();
        return Set
            .Where(p => ids.Contains(p.Id))
            .ToListAsync();
    }

    public async Task UpdateAsync(TEntity updated)
    {
        var existed = await Set.FindAsync(updated.Id);
        if (existed == null)
            return;

        mapper.Map(updated, existed);
        await SaveChangesAsync();
    }

    public async Task<CreateResponse> CreateOrUpdateAsync(TEntity entity)
    {
        var isCreated = false;
        var cur = await Set.FindAsync(entity.Id);
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

        return new CreateResponse
        {
            Id = entity.Id, 
            IsCreated = isCreated
        };
    }
}