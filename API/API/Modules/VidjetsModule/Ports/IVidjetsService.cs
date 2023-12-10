using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.VidjetsModule.DTO;
using API.Modules.VidjetsModule.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.VidjetsModule.Ports;

public interface IVidjetsService
{
    Task<Result<SearchResponseBaseDTO<VidjetOutDTO>>> GetVidjetsAsync(VidjetsSearchRequest searchReq);

    Task<Result<VidjetOutDTO>> GetVidjetByIdAsync([FromRoute] Guid vidjetId);

    Task<Result<CreateResponse>> CreateOrUpdateVidjet(Guid userId, VidjetCreateRequest vidjetCreateRequest);

    Task DeleteVidjetAsync([FromRoute] Guid vidjetId);

    Task<Result<VidjetResponse>> ResolveVidjetForBuyerAsync(VidjetRequest vidjetReq);
}