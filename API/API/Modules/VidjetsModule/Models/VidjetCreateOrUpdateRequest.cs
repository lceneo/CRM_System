using System.Text.Json.Nodes;

namespace API.Modules.VidjetsModule.Models;

public class VidjetCreateOrUpdateRequest
{
    public Guid Id { get; set; }
    public string Domen { get; set; }
    public JsonObject Styles { get; set; }
}