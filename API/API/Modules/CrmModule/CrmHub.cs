using API.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.Modules.CrmModule;

public interface ICrmHubNotifier
{
    Task NotifyChanges();
    Task NotifyChanges(Guid taskId);
}

public class CrmHubNotifier : ICrmHubNotifier
{
    private readonly IHubContext<CrmHub> hub;

    public CrmHubNotifier(IHubContext<CrmHub> hub)
    {
        this.hub = hub;
    }

    public async Task NotifyChanges()
    {
        await hub.Clients.Group(CrmHub.groupName).SendAsync("Changes", new CrmChanges());
    }

    public async Task NotifyChanges(Guid taskId)
    {
        await hub.Clients.Group(CrmHub.groupName).SendAsync("Changes", new CrmChanges{TaskId = taskId});
    }
}

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class CrmHub : Hub, IHub
{
    public static string Route => "/Hubs/Crm";

    public static string groupName = "All";

    public override Task OnConnectedAsync()
    {
        Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        return base.OnDisconnectedAsync(exception);
    }
}

public class CrmChanges
{
    public Guid? TaskId { get; set; }
}
