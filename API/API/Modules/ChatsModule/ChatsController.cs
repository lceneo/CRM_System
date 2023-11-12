using API.Extensions;
using API.Infrastructure;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Ports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.ChatsModule;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ChatsController : ControllerBase
{
    private readonly IChatsService chatsService;

    public ChatsController(IChatsService chatsService)
    {
        this.chatsService = chatsService;
    }

    [HttpGet("My")]
    public Task<ActionResult<IEnumerable<ChatOutDTO>>> GetChatsByUser()
        => GetChatsByUser(User.GetId());
    
    [HttpGet("ByUser")]
    public async Task<ActionResult<IEnumerable<ChatOutDTO>>> GetChatsByUser([FromQuery] Guid userId)
    {
        var response = await chatsService.GetChatsByUser(userId);
        return response.ActionResult;
    }

    [HttpPost("Messages")]
    public async Task<ActionResult> SendMessageAsync(SendMessageRequest request)
    {
        var senderId = User.GetId();
        var response = await chatsService.SendMessageAsync(
            request.RecipientId, 
            senderId,
            request.Message);

        if (!response.IsSuccess)
            return BadRequest(response.Error);
        
        var message = response.Value.message;
        return Ok(new
        {
            ChatId = message.Chat.Id,
            MessageId = message.Id,
        });
    }
}