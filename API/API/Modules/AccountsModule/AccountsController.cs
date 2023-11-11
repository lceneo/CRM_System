using System.Security.Claims;
using API.Extensions;
using API.Infrastructure;
using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Models;
using API.Modules.AccountsModule.Ports;
using API.Modules.MailsModule.Adapters;
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

    [HttpPost("Register")]
    public async Task<ActionResult<AccountsResponse>> RegisterClientAsync([FromBody] RegisterClientRequest regClientRequest)
    {
        var requestByAdmin = mapper.Map<RegisterByAdminRequest>(regClientRequest);
        var response = await accountsService.RegisterAsync(requestByAdmin);

        response.Specificate(resp => new {Id = resp});
        return response.ActionResult;
    }
    
    [Authorize]
    [HttpPost("Register/Admin")]
    public async Task<ActionResult<AccountsResponse>> RegisterAsync([FromBody] RegisterByAdminRequest regByAdminRequest)
    {
        var response = await accountsService.RegisterAsync(regByAdminRequest);

        response.Specificate(resp => new {Id = resp});
        return response.ActionResult;
    }

    [HttpPost("Login")]
    public async Task<ActionResult> LoginAsync([FromBody] LoginRequest loginRequest)
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
    public async Task<ActionResult> RecoverPasswordAsync([FromBody] PasswordRecoveryReq passwordRecoveryReq)
    {
        await accountsService.RecoverPasswordAsync(passwordRecoveryReq.Login);

        return NoContent();
    }

    [HttpPost("Password/{userId:Guid}")]
    public async Task<ActionResult> ChangePasswordUnauthorizedAsync([FromRoute] Guid userId,
        ChangePasswordUnauthorizedRequest changePasswordUnauthorizedReq)
    {
        var response = await accountsService.ChangePasswordUnauthorizedAsync(userId, changePasswordUnauthorizedReq);

        return response.ActionResult;
    }
}