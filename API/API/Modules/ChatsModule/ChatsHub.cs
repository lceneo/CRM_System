using API.Extensions;
using API.Infrastructure;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Ports;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.Modules.ChatsModule;

[Authorize]
public class ChatsHub : Hub, IHub
{
    public static string Route => "/Chats/Hub";
    
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
        foreach (var user in othersInGroup)
            await Clients.Group(user.Id.ToString()).SendAsync("Recieve", mapper.Map<MessageInChatDTO>(response.Value.message));

        await Clients.Caller.SendAsync("Success", new SendMessageResponse
        {
            ChatId = chat.Id,
            RequestNumber = request.RequestNumber
        });
    }

    public override Task OnConnectedAsync()
    {
        Groups.AddToGroupAsync(Context.ConnectionId, Context.User.GetId().ToString());
        return base.OnConnectedAsync();
    }
}