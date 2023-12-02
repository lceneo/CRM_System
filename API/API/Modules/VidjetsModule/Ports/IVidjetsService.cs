using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.VidjetsModule.DTO;
using API.Modules.VidjetsModule.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.VidjetsModule.Ports;

public interface IVidjetsService
{
    Task<Result<IEnumerable<VidjetOutDTO>>> GetVidjetsAsync();
    
    Task<Result<VidjetOutDTO>> GetVidjetByIdAsync([FromRoute] Guid vidjetId);
    
    Task<Result<CreateResponse>> CreateOrUpdateVidjet(VidjetCreateRequest vidjetCreateRequest);

    Task<ActionResult> DeleteVidjetAsync([FromRoute] Guid vidjetId);
}