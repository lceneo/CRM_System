using API.Extensions;
using API.Infrastructure;
using API.Modules.CrmModule.Crm;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.Modules.CrmModule;

public interface ICrmHubNotifier
{
    Task NotifyChanges(Guid senderId);
    Task NotifyChanges(Guid senderId, Guid taskId);
}

public class CrmHubNotifier : ICrmHubNotifier
{
    private readonly IHubContext<CrmHub> hub;
    private readonly CrmHubConnectionsProvider connectionsProvider;

    public CrmHubNotifier(IHubContext<CrmHub> hub, CrmHubConnectionsProvider connectionsProvider)
    {
        this.hub = hub;
        this.connectionsProvider = connectionsProvider;
    }

    public async Task NotifyChanges(Guid senderId)
    {
        foreach (var userId in connectionsProvider.Users)
        {
            if (senderId != userId)
                await hub.Clients.Group(userId.ToString()).SendAsync("Changes", new CrmChanges());
        }
    }

    public async Task NotifyChanges(Guid senderId, Guid taskId)
    {
        foreach (var userId in connectionsProvider.Users)
        {
            if (senderId != userId)
                await hub.Clients.Group(CrmHub.groupName).SendAsync("Changes", new CrmChanges{TaskId = taskId});
        }
    }
}

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class CrmHub : Hub, IHub
{
    public static string Route => "/Hubs/Crm";

    public static string groupName = "All";

    private readonly CrmHubConnectionsProvider connectionsProvider;

    public CrmHub(CrmHubConnectionsProvider connectionsProvider)
    {
        this.connectionsProvider = connectionsProvider;
    }

    public override Task OnConnectedAsync()
    {
        var userId = Context.User.GetId();
        Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        Groups.AddToGroupAsync(Context.ConnectionId, userId.ToString());
        connectionsProvider.AddUser(userId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User.GetId();
        Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.ToString());
        connectionsProvider.AddUser(userId);
        return base.OnDisconnectedAsync(exception);
    }
}

public class CrmChanges
{
    public Guid? TaskId { get; set; }
}
