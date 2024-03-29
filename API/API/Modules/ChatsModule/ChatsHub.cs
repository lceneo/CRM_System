using System.Collections.Concurrent;
using API.Extensions;
using API.Infrastructure;
using API.Modules.AccountsModule.Entities;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using API.Modules.ChatsModule.Ports;
using API.Modules.LogsModule;
using API.Modules.ProfilesModule.DTO;
using API.Modules.ProfilesModule.Entities;
using API.Modules.ProfilesModule.Ports;
using API.Modules.RatingModule.Entities;
using API.Modules.RatingModule.Ports;
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
    private readonly IMessagesRepository messagesRepository;
    private readonly IChatsRepository chatsRepository;
    private readonly IProfilesRepository profilesRepository;
    private readonly IRatingRepository ratingRepository;
    private readonly IMapper mapper;
    private readonly ILog log;

    public ChatsHub(
        HubConnectionsProvider connectionsProvider,
        IChatsService chatsService,
        IMessagesRepository messagesRepository,
        IChatsRepository chatsRepository,
        IProfilesRepository profilesRepository,
        IRatingRepository ratingRepository,
        IMapper mapper,
        ILog log)
    {
        this.connectionsProvider = connectionsProvider;
        this.chatsService = chatsService;
        this.messagesRepository = messagesRepository;
        this.chatsRepository = chatsRepository;
        this.profilesRepository = profilesRepository;
        this.ratingRepository = ratingRepository;
        this.mapper = mapper;
        this.log = log;
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
        if (othersInGroup.Any())
        {
            foreach (var user in othersInGroup)
            {
                try
                {
                    await Clients
                        .Group(user.Id.ToString())
                        .SendAsync("Recieve", mapper.Map<MessageOutDTO>(response.Value.message, opt => opt.Items["userId"] = user.Id));
                }
                catch{}
            }
        }
        else
        {
            await Managers
                .SendAsync("Recieve", mapper.Map<MessageOutDTO>(response.Value.message, opt => opt.Items["userId"] = Guid.Empty));
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

    public async Task Typing(TypingRequest request)
    {
        var userId = Context.User.GetId();
        var chatResponse = await chatsService.GetChatByIdAsync(userId, request.ChatId);
        if (!chatResponse.IsSuccess)
        {
            await Clients.Caller.SendAsync("Error", chatResponse.Error);
            return;
        }

        var chat = chatResponse.Value;
        var othersInGroup = chat.Profiles.Where(p => p.Id != userId);
        if (othersInGroup.Count() > 0)
        {
            foreach (var user in othersInGroup)
            {
                try
                {
                    await Clients.Group(user.Id.ToString())
                        .SendAsync("Typing", request);
                }
                catch{}
            }
        }
    }

    public async Task Check(CheckMessagesRequest request)
    {
        var userId = Context.User.GetId();
        var profile = await profilesRepository.GetByIdAsync(userId);
        var messages = messagesRepository.Search(
                request.ChatId,
                new MessagesSearchRequest {MessageIds = request.MessageIds.ToHashSet()},
                true)
            .Items;
        foreach (var message in messages)
        {
            var check = new CheckEntity {Message = message, Profile = profile};
            if (message.Checks == null)
                message.Checks = new HashSet<CheckEntity> {check};
            else
                message.Checks.Add(check);
        }
        await messagesRepository.SaveChangesAsync();
        
        var chat = await chatsRepository.GetByIdAsync(messages.First().Chat.Id);
        var response = new CheckMessagesResponse
        {
            Checker = mapper.Map<ProfileOutShortDTO>(profile),
            ChatId = chat.Id,
            MessageIds = request.MessageIds,
        };
        var othersInGroup = chat.Profiles.Where(p => p.Id != userId);
        if (othersInGroup.Any())
        {
            foreach (var user in othersInGroup)
            {
                try
                {
                    await Clients.Group(user.Id.ToString())
                        .SendAsync("Check", response);
                }
                catch{}
            }
        }
        else
        {
            await Managers.SendAsync("Check", response);
        }
    }

    public async Task Rate(RateManagerRequest request)
    {
        var userId = Context.User.GetId();
        var chat = await chatsRepository.GetByIdAsync(request.ChatId);
        if (chat == null)
        {
            await log.Error($"Hub. Не найден чат: {request.ChatId}");
            return;
        }

        var manager = chat.Profiles.FirstOrDefault(e => e.Account.Role == AccountRole.Manager);
        if (manager == null)
        {
            await log.Error($"В чате: {chat.Id} нет менеджера");
            return;
        }

        var rate = new RatingEntity
        {
            Chat = chat,
            Manager = manager,
            Comment = request.Comment,
            Score = request.Score,
        };
        await ratingRepository.CreateAsync(rate);
        await log.Info($"Пользователь: {userId} оставил отзыв о менеджере: {manager.Id} в чате: {chat.Id}");
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