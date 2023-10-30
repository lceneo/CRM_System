using API.DAL;
using API.Modules.ProfilesModule.Entities;
using API.Modules.ProfilesModule.Ports;
using AutoMapper;

namespace API.Modules.ProfilesModule.Adapters;

public class ProfilesRepository : CRURepository<ProfileEntity>,
    IProfilesRepository
{
    public ProfilesRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }
}