namespace API.Modules.CrmModule.Comments.Requests;

public class CreateOrUpdateTaskCommentRequest
{
    /// <summary>
    /// Если указан - пытается обновить сущность.
    ///
    /// Иначе создаёт новую
    /// </summary>
    public Guid? Id { get; set; }
    public string Text { get; set; }
}