using API.DAL.Repository;
using API.Modules.RatingModule.Entities;

namespace API.Modules.RatingModule.Ports;

public interface IRatingRepository : ICRUDRepository<RatingEntity>
{
    public IEnumerable<RatingEntity> GetByManagerAsync(Guid managerId);
}