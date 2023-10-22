using API.Infrastructure;
using Microsoft.AspNetCore.SignalR;

namespace API.Modules.ChatsModule;

public class ChatsHub : Hub, IHub
{
    public static string Route { get; }
}