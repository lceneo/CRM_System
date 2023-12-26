using System.Collections.Concurrent;
using API.Extensions;
using API.Infrastructure;
using API.Modules.AccountsModule.Entities;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Ports;
using API.Modules.ProfilesModule.DTO;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.Modules.ChatsModule;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatsHub : Hub, IHub
{
    private IClientProxy Managers => Clients.Group("Managers");

    public static string Route => "/Hubs/Chats";

    private readonly HubConnectionsProvider connectionsProvider;
    private readonly IChatsService chatsService;
    private readonly IMapper mapper;

    public ChatsHub(
        HubConnectionsProvider connectionsProvider,
        IChatsService chatsService,
        IMapper mapper)
    {
        this.connectionsProvider = connectionsProvider;
        this.chatsService = chatsService;
        this.mapper = mapper;
    }

    public async Task Send(SendMessageRequest request)
    {
        var senderId = Context.User.GetId();
        var response = await chatsService.SendMessageAsync(
            senderId,
            request);
        if (!response.IsSuccess)
        {
            await Clients.Caller.SendAsync("Error", response.Error);
            return;
        }

        var chat = response.Value.chat;
        var othersInGroup = chat.Profiles.Where(p => p.Id != senderId);
        if (othersInGroup.Count() > 0)
        {
            foreach (var user in othersInGroup)
            {
                try
                {
                    await Clients.Group(user.Id.ToString())
                        .SendAsync("Recieve", mapper.Map<MessageOutDTO>(response.Value.message));
                }
                catch{}
            }
        }
        else
        {
            await Managers.SendAsync("Recieve", mapper.Map<MessageOutDTO>(response.Value.message));
        }

        await Clients.Caller.SendAsync("Success", new SendMessageResponse
        {
            ChatId = chat.Id,
            MessageId = response.Value.message.Id,
            Type = response.Value.message.Type,
            TimeStamp = response.Value.message.DateTime,
            RequestNumber = request.RequestNumber
        });
    }

    public override Task OnConnectedAsync()
    {
        var userId = Context.User.GetId();
        var connectionId = Context.ConnectionId;
        Groups.AddToGroupAsync(connectionId, userId.ToString());
        if (Context.User.GetRole() is AccountRole.Manager)
            Groups.AddToGroupAsync(connectionId, "Managers");
        Groups.AddToGroupAsync(connectionId, "All");
        connectionsProvider.AddUser(userId);
        
        Clients.All.SendAsync("ActiveStatus", new ActiveStatusDTO
        {
            UserId = userId,
            Status = ActiveStatus.Connected,
        });

        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User.GetId();
        var connectionId = Context.ConnectionId;
        Groups.RemoveFromGroupAsync(connectionId, userId.ToString());
        Groups.RemoveFromGroupAsync(connectionId, "Managers");
        Groups.RemoveFromGroupAsync(connectionId, "All");
        connectionsProvider.RemoveUser(userId);

        Clients.All.SendAsync("ActiveStatus", new ActiveStatusDTO
        {
            UserId = userId,
            Status = ActiveStatus.Disconnected,
        });

        return base.OnDisconnectedAsync(exception);
    }
}