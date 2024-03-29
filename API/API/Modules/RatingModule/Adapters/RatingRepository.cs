using API.DAL;
using API.DAL.Repository;
using API.Modules.RatingModule.Entities;
using API.Modules.RatingModule.Ports;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.RatingModule.Adapters;

public class RatingRepository : CRUDRepository<RatingEntity>, IRatingRepository
{
    public RatingRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    public IEnumerable<RatingEntity> GetByManagerAsync(Guid managerId)
    {
        return Set
            .Include(e => e.Manager)
            .Include(e => e.Chat)
            .Where(e => e.Manager.Id == managerId);
    }
}