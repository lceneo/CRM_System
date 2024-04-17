using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.VidjetsModule.DTO;
using API.Modules.VidjetsModule.Models;

namespace API.Modules.VidjetsModule.Ports;

public interface IVidjetsService
{
    Task<Result<SearchResponseBaseDTO<VidjetOutDTO>>> GetVidjetsAsync(VidjetsSearchRequest searchReq);

    Task<Result<VidjetOutDTO>> GetVidjetByIdAsync(Guid vidjetId, Guid userId);

    Task<Result<CreateResponse<Guid>>> CreateOrUpdateVidjet(Guid userId, VidjetCreateOrUpdateRequest vidjetCreateOrUpdateRequest);

    Task DeleteVidjetAsync(Guid vidjetId, Guid userId);

    Task<Result<VidjetResponse>> ResolveVidjetForBuyerAsync(VidjetRequest vidjetReq);
}