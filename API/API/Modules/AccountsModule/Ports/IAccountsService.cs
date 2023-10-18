using API.Infrastructure;
using API.Modules.AccountsModule.DTO;
using API.Modules.AccountsModule.Models;

namespace API.Modules.AccountsModule.Ports;

public interface IAccountsService
{
    Task<Result<ClaimsResponse>> RegisterAsync(RegisterRequest registerRequest);
    Task<Result<ClaimsResponse>> LoginAsync(LoginRequest loginRequest);
}