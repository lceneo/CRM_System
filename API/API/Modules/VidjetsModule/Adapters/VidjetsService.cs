using System.Security.Claims;
using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.AccountsModule.Entities;
using API.Modules.AccountsModule.Ports;
using API.Modules.ChatsModule.Ports;
using API.Modules.LogsModule;
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
    private readonly ILog log;

    public VidjetsService(IChatsService chatsService,
        IAccountsService accountsService,
        IVidjetsRepository vidjetsRepository,
        IMapper mapper,
        IAccountsRepository accountsRepository,
        IProfilesRepository profilesRepository,
        ILog log)
    {
        this.chatsService = chatsService;
        this.accountsService = accountsService;
        this.vidjetsRepository = vidjetsRepository;
        this.mapper = mapper;
        this.accountsRepository = accountsRepository;
        this.profilesRepository = profilesRepository;
        this.log = log;
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

    public async Task<Result<VidjetOutDTO>> GetVidjetByIdAsync(Guid vidjetId, Guid userId)
    {
        var vidjetEntity = await vidjetsRepository.GetByIdAsync(vidjetId);
        if (vidjetEntity == null)
            return Result.NotFound<VidjetOutDTO>("Такого виджета не существует");

        return Result.Ok(mapper.Map<VidjetOutDTO>(vidjetEntity));
    }

    public async Task<Result<CreateResponse<Guid>>> CreateOrUpdateVidjet(Guid userId, VidjetCreateOrUpdateRequest vidjetCreateOrUpdateRequest)
    {
        var account = await accountsRepository.GetByIdAsync(userId);
        if (account == null)
            return Result.NotFound<CreateResponse<Guid>>("Такого пользователя не существует");
        var vidjet = await vidjetsRepository.SearchVidjetsAsync(new VidjetsSearchRequest
        {
            Domen = vidjetCreateOrUpdateRequest.Domen,
        });
        if (vidjet.Items.Count > 0)
            return Result.BadRequest<CreateResponse<Guid>>("Такой домен уже зарегистрирован в системе");

        var res = mapper.Map<VidjetEntity>(vidjetCreateOrUpdateRequest);
        res.Account = account;
        return Result.Ok(await vidjetsRepository.CreateOrUpdateAsync(res));
    }

    public async Task DeleteVidjetAsync(Guid vidjetId, Guid userId)
    {
        await vidjetsRepository.DeleteAsync(vidjetId);
        await log.Info($"Vidjet(Id: {vidjetId}) deleted by user(Id: {userId})");
    }

    public async Task<Result<VidjetResponse>> ResolveVidjetForBuyerAsync(VidjetRequest vidjetReq)
    {
        var vidjets = await vidjetsRepository.SearchVidjetsAsync(new VidjetsSearchRequest
            {
                Domen = vidjetReq.Domen,
            },
            true);
        if (vidjets.Items.Count == 0)
            return Result.NotFound<VidjetResponse>("Такой домен не найден");

        var vidjet = vidjets.Items.First();
        var clientProfile =
            await profilesRepository.CreateBuyerProfileForVidjetAsync(vidjetReq.Domen, vidjet.Account);
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, clientProfile.Id.ToString()),
            new Claim(ClaimTypes.Role, AccountRole.Buyer.ToString())
        };

        var response = await chatsService.GetOrCreateChatWithUsers(new[] {clientProfile.Id});
        if (!response.IsSuccess)
            return Result.BadRequest<VidjetResponse>(response.Error);

        await log.Info($"Vidjet(Id: {vidjet.Id}, Domen:{vidjet.Domen}) was resolved");
        return Result.Ok(new VidjetResponse
        {
            Token = accountsService.CreateToken(claims),
            ChatId = response.Value.Id,
            Styles = vidjet.Styles,
        });
    }
}