using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.VidjetsModule.Entities;
using API.Modules.VidjetsModule.Models;

namespace API.Modules.VidjetsModule.Ports;

public interface IVidjetsRepository : ICRUDRepository<VidjetEntity>
{
    Task<SearchResponseBaseDTO<VidjetEntity>> SearchVidjetsAsync(VidjetsSearchRequest searchReq,
        bool asTracking = false);
}