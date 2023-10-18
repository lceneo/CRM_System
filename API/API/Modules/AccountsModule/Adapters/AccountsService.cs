using System.Net;
using System.Security.Claims;
using API.Infrastructure;
using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Models;
using API.Modules.AccountsModule.Ports;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace API.Modules.AccountsModule.Adapters;

public class AccountsService : IAccountsService
{
    private readonly IMapper mapper;
    private readonly IAccountsRepository accountRepository;
    private readonly IPasswordHasher passwordHasher;

    public AccountsService(IMapper mapper, IAccountsRepository accountsRepository, IPasswordHasher passwordHasher)
    {
        this.mapper = mapper;
        this.accountRepository = accountsRepository;
        this.passwordHasher = passwordHasher;
    }
    
    public async Task<Result<ClaimsResponse>> RegisterAsync(RegisterRequest registerRequest)
    {
        var cur = await accountRepository.GetByLoginAsync(registerRequest.Login);
        if (cur != null)
            return Result.Fail<ClaimsResponse>("Такой пользователь уже существует.");

        var accountEntity = mapper.Map<AccountEntity>(registerRequest);
        await accountRepository.CreateAsync(accountEntity);
        return await LoginAsync(mapper.Map<LoginRequest>(registerRequest));
    }

    public async Task<Result<ClaimsResponse>> LoginAsync(LoginRequest loginRequest)
    {
        var cur = await accountRepository.GetByLoginAsync(loginRequest.Login);
        if (cur == null)
            return Result.Fail<ClaimsResponse>("Такого пользователя не существует.", HttpStatusCode.NotFound);

        var isPasswordValid = passwordHasher.IsPasswordEqualHashed(cur.PasswordHash, loginRequest.Password);
        if (!isPasswordValid)
            return Result.Fail<ClaimsResponse>("Неправильный пароль.");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, cur.Id.ToString()),
            new Claim(ClaimTypes.Role, cur.Role.ToString()),
        };
        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        
        return Result.Ok(new ClaimsResponse(claimsIdentity, cur.Role));
    }
}