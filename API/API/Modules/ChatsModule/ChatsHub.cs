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

    private readonly IChatsService chatsService;
    private readonly IMapper mapper;

    public ChatsHub(IChatsService chatsService,
        IMapper mapper)
    {
        this.chatsService = chatsService;
        this.mapper = mapper;
    }

    public async Task Send(SendMessageRequest request)
    {
        var senderId = Context.User.GetId();
        var response = await chatsService.SendMessageAsync(
            request.RecipientId,
            senderId,
            request.Message);
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
                await Clients.Group(user.Id.ToString())
                    .SendAsync("Recieve", mapper.Map<MessageOutDTO>(response.Value.message));
        }
        else
        {
            await Managers.SendAsync("Recieve", mapper.Map<MessageOutDTO>(response.Value.message));
        }

        await Clients.Caller.SendAsync("Success", new SendMessageResponse
        {
            ChatId = chat.Id,
            MessageId = response.Value.message.Id,
            TimeStamp = response.Value.message.DateTime,
            RequestNumber = request.RequestNumber
        });
    }

    public async Task Join(JoinChatRequest joinChatRequest)
    {
        var senderId = Context.User.GetId();
        var response = await chatsService.JoinChatAsync(joinChatRequest.ChatId, senderId);
        if (!response.IsSuccess)
        {
            await Clients.Caller.SendAsync("Error", response.Error);
            return;
        }

        foreach (var user in response.Value)
            await Clients.Group(user.Id.ToString()).SendAsync("ChatEventJoin", mapper.Map<ProfileOutDTO>(user));

        await Managers.SendAsync("UpdateFreeChats");

        await Clients.Caller.SendAsync("SuccessJoin");
    }

    public override Task OnConnectedAsync()
    {
        Groups.AddToGroupAsync(Context.ConnectionId, Context.User.GetId().ToString());
        if (Context.User.GetRole() is AccountRole.Manager)
            Groups.AddToGroupAsync(Context.ConnectionId, "Managers");

        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Groups.RemoveFromGroupAsync(Context.ConnectionId, Context.User.GetId().ToString());
        Groups.RemoveFromGroupAsync(Context.ConnectionId, "Managers");

        return base.OnDisconnectedAsync(exception);
    }
}