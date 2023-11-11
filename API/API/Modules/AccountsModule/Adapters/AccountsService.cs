using System.Net;
using System.Security.Claims;
using API.Infrastructure;
using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Models;
using API.Modules.AccountsModule.Ports;
using API.Modules.MailsModule.Ports;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace API.Modules.AccountsModule.Adapters;

public class AccountsService : IAccountsService
{
    private readonly IMapper mapper;
    private readonly IAccountsRepository accountRepository;
    private readonly IPasswordHasher passwordHasher;
    private readonly IMailMessagesService mailMessagesService;

    public AccountsService(IMapper mapper,
        IAccountsRepository accountsRepository,
        IPasswordHasher passwordHasher,
        IMailMessagesService mailMessagesService)
    {
        this.mapper = mapper;
        this.accountRepository = accountsRepository;
        this.passwordHasher = passwordHasher;
        this.mailMessagesService = mailMessagesService;
    }
    
    public async Task<Result<Guid>> RegisterAsync(RegisterByAdminRequest registerByAdminRequest)
    {
        var cur = await accountRepository.GetByLoginAsync(registerByAdminRequest.Login);
        if (cur != null)
            return Result.BadRequest<Guid>("Такой пользователь уже существует.");

        var accountEntity = mapper.Map<AccountEntity>(registerByAdminRequest);
        await accountRepository.CreateAsync(accountEntity);
        await mailMessagesService.SendVerificationAsync(accountEntity.Login);
        return Result.Ok(accountEntity.Id);
    }

    public async Task<Result<ClaimsResponse>> LoginAsync(LoginRequest loginRequest)
    {
        var cur = await accountRepository.GetByLoginAsync(loginRequest.Login);
        if (cur == null)
            return Result.NotFound<ClaimsResponse>("Такого пользователя не существует.");

        if (cur.PasswordHash == null)
            return Result.BadRequest<ClaimsResponse>("Пользователь не установил себе пароль.");
        
        var isPasswordValid = passwordHasher.IsPasswordEqualHashed(cur.PasswordHash, loginRequest.Password);
        if (!isPasswordValid)
            return Result.BadRequest<ClaimsResponse>("Неправильный пароль.");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, cur.Id.ToString()),
            new Claim(ClaimTypes.Role, cur.Role.ToString()),
        };
        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        
        return Result.Ok(new ClaimsResponse(claimsIdentity, cur.Role));
    }

    public async Task<Result<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest changePasswordRequest)
    {
        var cur = await accountRepository.GetByIdAsync(userId);
        if (cur == null)
            return Result.NotFound<bool>("Такого пользователя нет.");
        
        var isPasswordValid = passwordHasher.IsPasswordEqualHashed(cur.PasswordHash, changePasswordRequest.OldPassword);
        if (!isPasswordValid)
            return Result.BadRequest<bool>("Неправильный пароль.");

        cur.PasswordHash = passwordHasher.CalculateHash(changePasswordRequest.NewPassword);
        await accountRepository.UpdateAsync(cur);
        return Result.NoContent<bool>();
    }

    public async Task RecoverPasswordAsync(string login)
    {
        await mailMessagesService.SendPasswordRecovery(login);
    }

    public async Task<Result<bool>> ChangePasswordUnauthorizedAsync(Guid userId, 
        ChangePasswordUnauthorizedRequest changePasswordUnauthorizedRequest)
    {
        var cur = await accountRepository.GetByIdAsync(userId);
        if (cur == null)
            return Result.NotFound<bool>("Такого пользователя нет.");

        if (cur.PasswordHash != null)
            return Result.BadRequest<bool>("У пользователя уже есть пароль.");

        cur.PasswordHash = passwordHasher.CalculateHash(changePasswordUnauthorizedRequest.Password);
        await accountRepository.UpdateAsync(cur);
        return Result.NoContent<bool>();
    }
}