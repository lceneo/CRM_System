using API.Extensions;
using API.Infrastructure.BaseApiDTOs;
using API.Infrastructure.Extensions;
using API.Modules.AccountsModule.Entities;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Ports;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.ChatsModule;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ChatsController : ControllerBase
{
    private readonly IChatsService chatsService;
    private readonly IMapper mapper;

    public ChatsController(IChatsService chatsService,
        IMapper mapper)
    {
        this.chatsService = chatsService;
        this.mapper = mapper;
    }

    [HttpGet("Free")]
    public async Task<ActionResult<IEnumerable<ChatOutDTO>>> GetFreeChats()
    {
        var response = await chatsService.GetFreeChats(User.GetId());
        return response.ActionResult;
    }

    [HttpGet("My")]
    public async Task<ActionResult<IEnumerable<ChatOutDTO>>> GetMyChats()
    {
        var response = await chatsService.GetChatsByUser(User.GetId());
        return response.ActionResult;
    }

    [HttpPost("Search")]
    public async Task<ActionResult<SearchResponseBaseDTO<ChatOutDTO>>> SearchChats(ChatsSearchRequest req)
    {
        var response = await chatsService.SearchChats(User.GetId(), req);
        return response.ActionResult;
    }

    [HttpGet("{chatId:Guid}")]
    public async Task<ActionResult<ChatOutDTO>> GetChatByIdAsync([FromRoute] Guid chatId)
    {
        var response = await chatsService.GetChatByIdAsync(User.GetId(), chatId);
        return response.ActionResult;
    }

    [HttpPost("{chatId:Guid}/Status")]
    [Authorize(Roles = $"{nameof(AccountRole.Manager)},{nameof(AccountRole.Admin)}")]
    public async Task<ActionResult> ChangeChatStatus([FromRoute] Guid chatId, [FromBody] ChangeChatStatusRequest req)
    {
        var response = await chatsService.ChangeChatStatus(chatId, req);
        return response.ActionResult;
    }

    [HttpPatch]
    public async Task<ActionResult<CreateResponse>> ChangeChat([FromBody] ChangeChatRequest request)
    {
        var response = await chatsService.ChangeChat(request);
        return response.ActionResult;
    }

    [HttpPost("{chatId:Guid}/Join")]
    [Authorize(Roles = $"{nameof(AccountRole.Manager)},{nameof(AccountRole.Admin)}")]
    public async Task<ActionResult> JoinChatAsync([FromRoute] Guid chatId)
    {
        var response = await chatsService.JoinChatAsync(chatId, User.GetId());
        return response.ActionResult;
    }

    [HttpPost("{chatId:Guid}/Leave")]
    [Authorize(Roles = $"{nameof(AccountRole.Manager)},{nameof(AccountRole.Admin)}")]
    public async Task<ActionResult> LeaveChatAsync([FromRoute] Guid chatId)
    {
        var response = await chatsService.LeaveChatAsync(chatId, User.GetId());
        return response.ActionResult;
    }

    [HttpPost("Messages")]
    public async Task<ActionResult<MessageInChatDTO>> SendMessageAsync(SendMessageRequest request)
    {
        var senderId = User.GetId();
        var response = await chatsService.SendMessageAsync(
            senderId,
            request);

        if (!response.IsSuccess)
            return BadRequest(response.Error);

        var message = response.Value.message;
        return Ok(mapper.MapMessage(message, senderId));
    }

    [HttpGet("{chatId:Guid}/Messages")]
    public async Task<ActionResult<IEnumerable<MessageOutDTO>>> SearchMessagesAsync(
        [FromRoute] Guid chatId,
        [FromQuery] MessagesSearchRequest messagesSearchReq)
    {
        var response = chatsService.SearchMessages(chatId, User.GetId(), messagesSearchReq);
        return response.ActionResult;
    }

    [HttpPost("{chatId:Guid}/Messages/Check")]
    public async Task<ActionResult<CheckMessagesResponse>> CheckMessages(
        [FromRoute]Guid chatId,
        [FromBody]IEnumerable<Guid> messageIds)
    {
        var req = new CheckMessagesRequest
        {
            ChatId = chatId,
            MessageIds = messageIds,
        };
        var result = await chatsService.CheckMessages(req, User.GetId());
        return result.ActionResult;
    }
}