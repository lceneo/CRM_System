using API.DAL;
using API.DAL.Repository;
using API.Modules.VidjetsModule.Entities;
using API.Modules.VidjetsModule.Ports;
using AutoMapper;

namespace API.Modules.VidjetsModule.Adapters;

public class VidjetsRepository : CRUDRepository<VidjetEntity>, IVidjetsRepository
{
    public VidjetsRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }
    
    
}