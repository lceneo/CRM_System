using API.Infrastructure;
using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Models;

namespace API.Modules.AccountsModule.Ports;

public interface IAccountsService
{
    Task<Result<Guid>> RegisterAsync(RegisterByAdminRequest registerByAdminRequest);
    Task<Result<ClaimsResponse>> LoginAsync(LoginRequest loginRequest);
    Task RecoverPasswordAsync(string login);
    Task<Result<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest changePasswordRequest);
    Task<Result<bool>> ChangePasswordUnauthorizedAsync(Guid userId,
        ChangePasswordUnauthorizedRequest changePasswordUnauthorizedRequest);
}