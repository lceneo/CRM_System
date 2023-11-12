using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ProfilesModule.ApiDTO;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.ProfilesModule.Ports;

public interface IProfilesRepository : ICRURepository<ProfileEntity>
{
    public SearchResponseBaseDTO<ProfileEntity> Search(ProfilesSearchRequest searchReq);
    Task<ProfileEntity?> GetByIdAsync(Guid id);
}