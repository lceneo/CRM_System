using System.Security.Claims;
using API.Infrastructure;
using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Models;
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

    public AccountsController(IAccountsService accountsService, IMapper mapper)
    {
        this.accountsService = accountsService;
        this.mapper = mapper;
    }

    [HttpPost("Register")]
    public async Task<ActionResult<AccountsResponse>> RegisterAsync([FromBody] RegisterRequest regRequest)
    {
        var response = await accountsService.RegisterAsync(regRequest);
        if (!response.IsSuccess)
            return response.ActionResult;
        
        var principal = new ClaimsPrincipal(response.Value.Credentials);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
        
        response.Specificate(claimsResp => mapper.Map<AccountsResponse>(claimsResp));
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
}