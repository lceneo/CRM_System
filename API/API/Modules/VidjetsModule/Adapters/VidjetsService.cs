using System.Security.Claims;
using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.AccountsModule.Entities;
using API.Modules.AccountsModule.Ports;
using API.Modules.ChatsModule.Ports;
using API.Modules.ProfilesModule.Ports;
using API.Modules.VidjetsModule.DTO;
using API.Modules.VidjetsModule.Entities;
using API.Modules.VidjetsModule.Models;
using API.Modules.VidjetsModule.Ports;
using AutoMapper;

namespace API.Modules.VidjetsModule.Adapters;

public class VidjetsService : IVidjetsService
{
    private readonly IChatsService chatsService;
    private readonly IAccountsService accountsService;
    private readonly IVidjetsRepository vidjetsRepository;
    private readonly IMapper mapper;
    private readonly IAccountsRepository accountsRepository;
    private readonly IProfilesRepository profilesRepository;

    public VidjetsService(IChatsService chatsService,
        IAccountsService accountsService,
        IVidjetsRepository vidjetsRepository,
        IMapper mapper,
        IAccountsRepository accountsRepository,
        IProfilesRepository profilesRepository)
    {
        this.chatsService = chatsService;
        this.accountsService = accountsService;
        this.vidjetsRepository = vidjetsRepository;
        this.mapper = mapper;
        this.accountsRepository = accountsRepository;
        this.profilesRepository = profilesRepository;
    }

    public async Task<Result<SearchResponseBaseDTO<VidjetOutDTO>>> GetVidjetsAsync(VidjetsSearchRequest searchReq)
    {
        var searchResp = await vidjetsRepository.SearchVidjetsAsync(searchReq);

        return Result.Ok(new SearchResponseBaseDTO<VidjetOutDTO>
        {
            TotalCount = searchResp.TotalCount,
            Items = mapper.Map<List<VidjetOutDTO>>(searchResp.Items),
        });
    }

    public async Task<Result<VidjetOutDTO>> GetVidjetByIdAsync(Guid vidjetId)
    {
        var vidjetEntity = await vidjetsRepository.GetByIdAsync(vidjetId);
        if (vidjetEntity == null)
            return Result.NotFound<VidjetOutDTO>("Такого виджета не существует");

        return Result.Ok(mapper.Map<VidjetOutDTO>(vidjetEntity));
    }

    public async Task<Result<CreateResponse>> CreateOrUpdateVidjet(Guid userId, VidjetCreateRequest vidjetCreateRequest)
    {
        var account = await accountsRepository.GetByIdAsync(userId);
        if (account == null)
            return Result.NotFound<CreateResponse>("Такого пользователя не существует");
        var vidjet = await vidjetsRepository.SearchVidjetsAsync(new VidjetsSearchRequest
        {
            Domen = vidjetCreateRequest.Domen,
        });
        if (vidjet.Items.Count > 0)
            return Result.BadRequest<CreateResponse>("Такой домен уже зарегистрирован в системе");

        var res = mapper.Map<VidjetEntity>(vidjetCreateRequest);
        res.Account = account;
        return Result.Ok(await vidjetsRepository.CreateOrUpdateAsync(res));
    }

    public async Task DeleteVidjetAsync(Guid vidjetId)
    {
        await vidjetsRepository.DeleteAsync(vidjetId);
    }

    public async Task<Result<VidjetResponse>> ResolveVidjetForBuyerAsync(VidjetRequest vidjetReq)
    {
        var vidjet = await vidjetsRepository.SearchVidjetsAsync(new VidjetsSearchRequest
            {
                Domen = vidjetReq.Domen,
            },
            true);
        if (vidjet.Items.Count == 0)
            return Result.NotFound<VidjetResponse>("Такой домен не найден");

        var clientProfile =
            await profilesRepository.CreateBuyerProfileForVidjetAsync(vidjetReq.Domen, vidjet.Items.First().Account);
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, clientProfile.Id.ToString()),
            new Claim(ClaimTypes.Role, AccountRole.Buyer.ToString())
        };

        var response = await chatsService.GetOrCreateChatWithUsers(new[] {clientProfile.Id});
        if (!response.IsSuccess)
            return Result.BadRequest<VidjetResponse>(response.Error);

        return Result.Ok(new VidjetResponse
        {
            Token = accountsService.CreateToken(claims),
            ChatId = response.Value.Id,
        });
    }
}