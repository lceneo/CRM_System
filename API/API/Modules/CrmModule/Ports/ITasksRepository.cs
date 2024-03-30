using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.Entities;
using API.Modules.CrmModule.Models;

namespace API.Modules.CrmModule.Ports;

public interface ITasksRepository : ICRUDRepository<TaskEntity>
{
    public Task<SearchResponseBaseDTO<TaskEntity>> Search(SearchTasksRequest request, bool asNoTracking = false);
}