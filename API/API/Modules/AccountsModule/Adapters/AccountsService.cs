﻿using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Infrastructure;
using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Entities;
using API.Modules.AccountsModule.Models;
using API.Modules.AccountsModule.Ports;
using API.Modules.LogsModule;
using API.Modules.MailsModule.Ports;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Tokens;

namespace API.Modules.AccountsModule.Adapters;

public class AccountsService : IAccountsService
{
    private readonly IMapper mapper;
    private readonly IAccountsRepository accountRepository;
    private readonly IPasswordHasher passwordHasher;
    private readonly IMailMessagesService mailMessagesService;
    private readonly ILog log;

    public AccountsService(
        IMapper mapper,
        ILog log,
        IAccountsRepository accountsRepository,
        IPasswordHasher passwordHasher,
        IMailMessagesService mailMessagesService)
    {
        this.mapper = mapper;
        this.log = log;
        this.accountRepository = accountsRepository;
        this.passwordHasher = passwordHasher;
        this.mailMessagesService = mailMessagesService;
    }

    public async Task<Result<Guid>> RegisterAsync(RegisterByAdminRequest registerByAdminRequest)
    {
        var account = await accountRepository.GetByLoginAsync(registerByAdminRequest.Login);
        if (account != null)
            return Result.BadRequest<Guid>("Такой пользователь уже существует.");

        account = mapper.Map<AccountEntity>(registerByAdminRequest);
        await accountRepository.CreateAsync(account);
        await mailMessagesService.SendVerificationAsync(account.Login);
        
        await log.Info($"Зарегистрирован аккаунт с Login: {account.Login}, Email: {account.Email}");
        return Result.Ok(account.Id);
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

        await log.Info($"Выполнен вход в аккаунт Login: {cur.Login}");
        return Result.Ok(GetClaims(cur));
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
        
        await log.Info($"Изменён пароль для Account (Login: {cur.Login})");
        return Result.NoContent<bool>();
    }

    private ConcurrentDictionary<Guid, string> loginsByRecover = new();
    public async Task<Result<bool>> SendPasswordRecovery(string login)
    {
        var user = await accountRepository.GetByLoginAsync(login);
        if (user == null)
            return Result.NotFound<bool>("Такого пользователя не существует");

        var recoverId = new Guid();
        await mailMessagesService.SendPasswordRecovery(login, recoverId);
        loginsByRecover.AddOrUpdate(recoverId, (key) => login,  (key, value) => login);
        return Result.NoContent<bool>();
    }

    public async Task<Result<RecoverPasswordResponse>> RecoverPassword(Guid recoverId, PasswordRecoveryReq request)
    {
        if (!loginsByRecover.TryGetValue(recoverId, out var login))
            return Result.NotFound<RecoverPasswordResponse>("Такого запроса на восстановление нет");

        var user = await accountRepository.GetByLoginAsync(login);
        user.PasswordHash = passwordHasher.CalculateHash(request.Password);
        await accountRepository.UpdateAsync(user);
        
        return Result.Ok(new RecoverPasswordResponse
        {
            Email = user.Email,
        });
    }

    public async Task<Result<ClaimsResponse>> ChangePasswordUnauthorizedAsync(Guid userId,
        ChangePasswordUnauthorizedRequest changePasswordUnauthorizedRequest)
    {
        var cur = await accountRepository.GetByIdAsync(userId);
        if (cur == null)
            return Result.NotFound<ClaimsResponse>("Такого пользователя нет.");

        if (cur.PasswordHash != null)
            return Result.BadRequest<ClaimsResponse>("У пользователя уже есть пароль.");

        cur.PasswordHash = passwordHasher.CalculateHash(changePasswordUnauthorizedRequest.Password);
        await accountRepository.UpdateAsync(cur);

        await log.Info($"Установлен пароль для аккаунта Login: {cur.Login}");
        return Result.Ok(GetClaims(cur));
    }

    private ClaimsResponse GetClaims(AccountEntity account)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new Claim(ClaimTypes.Role, account.Role.ToString()),
        };
        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

        return new ClaimsResponse(claimsIdentity, account.Id, account.Role, CreateToken(claims));
    }

    public string CreateToken(List<Claim> claims)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            Config.JwtSecurityKey));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds);

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return jwt;
    }
}