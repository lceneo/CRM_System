using API.DAL.Repository;
using API.Modules.StaticModule.Entities;

namespace API.Modules.StaticModule.Ports;

public interface IStaticsRepository : ICRUDRepository<FileEntity>
{
    Task<FileEntity?> Get(Guid userId, string fileKey);
    IEnumerable<FileEntity> Get(IEnumerable<string> fileKeys);
}