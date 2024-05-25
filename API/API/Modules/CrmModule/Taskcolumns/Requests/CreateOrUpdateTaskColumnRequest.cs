namespace API.Modules.CrmModule.Taskcolumns.Requests;

public class CreateOrUpdateTaskColumnRequest
{
    public Guid? Id { get; set; }
    public string? Name { get; set; }
    public int? Order { get; set; }
}