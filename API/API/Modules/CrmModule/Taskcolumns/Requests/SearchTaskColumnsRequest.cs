using API.Infrastructure.BaseApiDTOs;

namespace API.Modules.CrmModule.Taskcolumns.Requests;

public class SearchTaskColumnsRequest : SearchRequestBaseDTO
{
    public string? Name { get; set; }
    public int? Order { get; set; }
}