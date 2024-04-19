namespace API.Modules.CrmModule.Comments.Requests;

public class SearchTaskCommentsRequest
{
    public HashSet<Guid>? Ids { get; set; }
    public Guid? AuthorId { get; set; }
    public string? Text { get; set; }
}