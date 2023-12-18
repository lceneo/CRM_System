using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Infrastructure;
using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Models;
using API.Modules.AccountsModule.Ports;
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

    public AccountsService(
        IMapper mapper,
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
        return Result.NoContent<bool>();
    }

    public async Task RecoverPasswordAsync(string login)
    {
        await mailMessagesService.SendPasswordRecovery(login);
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