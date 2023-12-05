﻿using System.Security.Claims;
using API.DAL;
using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.AccountsModule.Ports;
using API.Modules.ChatsModule.Ports;
using API.Modules.VidjetsModule.DTO;
using API.Modules.VidjetsModule.Models;
using API.Modules.VidjetsModule.Ports;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.VidjetsModule.Adapters;

public class VidjetsService : IVidjetsService
{
    private readonly IChatsService chatsService;
    private readonly IAccountsService accountsService;
    private readonly DataContext dataContext;

    public VidjetsService(IChatsService chatsService,
        IAccountsService accountsService,
        DataContext dataContext)
    {
        this.chatsService = chatsService;
        this.accountsService = accountsService;
        this.dataContext = dataContext;
    }

    public Task<Result<IEnumerable<VidjetOutDTO>>> GetVidjetsAsync()
    {
        throw new NotImplementedException();
    }

    public Task<Result<VidjetOutDTO>> GetVidjetByIdAsync(Guid vidjetId)
    {
        throw new NotImplementedException();
    }

    public Task<Result<CreateResponse>> CreateOrUpdateVidjet(VidjetCreateRequest vidjetCreateRequest)
    {
        throw new NotImplementedException();
    }

    public Task<ActionResult> DeleteVidjetAsync(Guid vidjetId)
    {
        throw new NotImplementedException();
    }

    public async Task<Result<VidjetResponse>> ResolveVidjetForUserAsync(VidjetRequest vidjetReq, long ip)
    {
        if (vidjetReq.Domen == "localhost")
        {
            var clientProfile = dataContext.Profiles.First(e => e.Account.Id != e.Id);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, clientProfile.Id.ToString())
            };

            var chat = await chatsService.GetOrCreateChatWithUsers(new[] {clientProfile.Id});
            return Result.Ok(new VidjetResponse
            {
                Token = accountsService.CreateToken(claims),
                ChatId = chat.Id,
            });
        }

        return Result.NotFound<VidjetResponse>("Такого домена не существует");
    }
}