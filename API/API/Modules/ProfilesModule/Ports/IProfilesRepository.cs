using API.DAL;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.ProfilesModule.Ports;

public interface IProfilesRepository : ICRURepository<ProfileEntity>
{
    
}