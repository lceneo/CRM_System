﻿using System.Security.Claims;
using API.Extensions;
using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Entities;
using API.Modules.AccountsModule.Ports;
using AutoMapper;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.AccountsModule;

[Route("api/[controller]")]
[ApiController]
public class AccountsController : ControllerBase
{
    private readonly IAccountsService accountsService;
    private readonly IMapper mapper;

    public AccountsController(IAccountsService accountsService,
        IMapper mapper)
    {
        this.accountsService = accountsService;
        this.mapper = mapper;
    }

    [Authorize]
    [HttpGet("My")]
    public ActionResult GetMyAcc()
    {
        return Ok(new
        {
            Id = User.GetId(),
            Role = User.GetRole(),
        });
    }

    [HttpPost("Register")]
    public async Task<ActionResult<AccountsResponse>> RegisterClientAsync(
        [FromBody] RegisterClientRequest regClientRequest)
    {
        var requestByAdmin = mapper.Map<RegisterByAdminRequest>(regClientRequest);
        var response = await accountsService.RegisterAsync(requestByAdmin);

        response.Specificate(resp => new {Id = resp});
        return response.ActionResult;
    }

    [Authorize(Roles = nameof(AccountRole.Admin))]
    [HttpPost("Register/Admin")]
    public async Task<ActionResult<AccountsResponse>> RegisterAsync([FromBody] RegisterByAdminRequest regByAdminRequest)
    {
        var response = await accountsService.RegisterAsync(regByAdminRequest);

        response.Specificate(resp => new {Id = resp});
        return response.ActionResult;
    }

    [HttpPost("Login")]
    public async Task<ActionResult<AccountsResponse>> LoginAsync([FromBody] LoginRequest loginRequest)
    {
        var response = await accountsService.LoginAsync(loginRequest);
        if (!response.IsSuccess)
            return response.ActionResult;

        var principal = new ClaimsPrincipal(response.Value.Credentials);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        response.Specificate((claimsResp) => mapper.Map<AccountsResponse>(claimsResp));
        return response.ActionResult;
    }

    [Authorize]
    [HttpPost("Logout")]
    public async Task<ActionResult> LogoutAsync()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return NoContent();
    }

    [Authorize]
    [HttpPost("Password/Change")]
    public async Task<ActionResult> ChangePasswordAsync(ChangePasswordRequest changePasswordRequest)
    {
        var response = await accountsService.ChangePasswordAsync(User.GetId(), changePasswordRequest);

        return response.ActionResult;
    }

    [HttpPost("Password/Recover")]
    public async Task<ActionResult> RecoverPasswordAsync([FromBody] PasswordSendRecoveryReq passwordSendRecoveryReq)
    {
        await accountsService.SendPasswordRecovery(passwordSendRecoveryReq.Login);

        return NoContent();
    }

    [HttpPost("Password/Recover/{recoverId:Guid}")]
    public async Task<ActionResult<RecoverPasswordResponse>> RecoverPasswordAsync([FromRoute] Guid recoverId, [FromBody]PasswordRecoveryReq request)
    {
        var response = await accountsService.RecoverPassword(recoverId, request);
        return response.ActionResult;
    }

    [HttpPost("Password/{userId:Guid}")]
    public async Task<ActionResult<AccountsResponse>> ChangePasswordUnauthorizedAsync([FromRoute] Guid userId,
        ChangePasswordUnauthorizedRequest changePasswordUnauthorizedReq)
    {
        var response = await accountsService.ChangePasswordUnauthorizedAsync(userId, changePasswordUnauthorizedReq);
        if (!response.IsSuccess)
            return response.ActionResult;

        var principal = new ClaimsPrincipal(response.Value.Credentials);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        response.Specificate((claimsResp) => mapper.Map<AccountsResponse>(claimsResp));
        return response.ActionResult;
    }
}