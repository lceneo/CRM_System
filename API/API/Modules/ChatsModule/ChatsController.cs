using API.Extensions;
using API.Infrastructure;
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
    
    [HttpGet("My")]
    public async Task<ActionResult<IEnumerable<ChatOutDTO>>> GetMyChats()
    {
        var response = await chatsService.GetChatsByUser(User.GetId());
        return  response.ActionResult;
    }

    [HttpGet("{chatId:Guid}")]
    public async Task<ActionResult<ChatOutDTO>> GetChatByIdAsync()
    {
        var response = await chatsService.GetChatsByUser(User.GetId());
        return response.ActionResult;
    }

    [HttpPost("Messages")]
    public async Task<ActionResult<MessageInChatDTO>> SendMessageAsync(SendMessageRequest request)
    {
        var senderId = User.GetId();
        var response = await chatsService.SendMessageAsync(
            request.RecipientId, 
            senderId,
            request.Message);

        if (!response.IsSuccess)
            return BadRequest(response.Error);
        
        var message = response.Value.message;
        return Ok(mapper.Map<MessageInChatDTO>(message));
    }

    [HttpPost("{chatId:Guid}/Messages")]
    public async Task<ActionResult<IEnumerable<MessageInChatDTO>>> SearchMessagesAsync(
        [FromRoute] Guid chatId,
        [FromQuery]MessagesSearchRequest messagesSearchReq)
    {
        var response = chatsService.SearchMessages(chatId, messagesSearchReq);
        return response.ActionResult;
    }
}