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

    [HttpGet("ByUser/{userId:Guid}")]
    public async Task<ActionResult<IEnumerable<ChatOutDTO>>> GetChatsByUser([FromQuery] Guid userId)
    {
        var response = await chatsService.GetChatsByUser(userId);
        return response.ActionResult;
    }

    [HttpPost]
    public async Task<ActionResult> SendMessageAsync(SendMessageRequest request)
    {
        var response = await chatsService.SendMessageAsync(
            request.RecipientId, 
            request.SenderId, 
            request.Message);

        return response.ActionResult;
    }
}