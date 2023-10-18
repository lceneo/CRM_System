using Microsoft.AspNetCore.Mvc;

namespace API.DAL;

[Route("api/[controller]")]
[ApiController]
public class DatabaseController : ControllerBase
{
    private readonly DataContext dataContext;

    public DatabaseController(DataContext dataContext)
    {
        this.dataContext = dataContext;
    }

    [HttpPost]
    public ActionResult RecreateDatabase()
    {
        dataContext.RecreateDatabase();
        
        return NoContent();
    }
}