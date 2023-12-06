using API.DAL.Repository;
using API.Modules.VidjetsModule.Entities;

namespace API.Modules.VidjetsModule.Ports;

public interface IVidjetsRepository : ICRUDRepository<VidjetEntity>
{
}