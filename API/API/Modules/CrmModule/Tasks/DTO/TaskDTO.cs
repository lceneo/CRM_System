using API.Modules.ClientsModule.DTO;
using API.Modules.CrmModule.Comments.DTO;
using API.Modules.CrmModule.Taskcolumns.DTO;
using API.Modules.CrmModule.Tasks.Entities;
using API.Modules.ProductsModule.DTO;
using API.Modules.ProfilesModule.DTO;

namespace API.Modules.CrmModule.Tasks.DTO;

public class TaskDTO
{
    public Guid Id { get; set; }
    public ProfileOutDTO? AssignedTo { get; set; }
    public TaskColumnDTO Column { get; set; }
    public string Title { get; set; }
    public string Descrption { get; set; }
    public TaskActionDTO Creation { get; set; }
    public TaskActionDTO LastEdition { get; set; }
    public IEnumerable<TaskCommentDTO> Comments { get; set; }
    public IEnumerable<ProductDTO> Products { get; set; }
    public ClientDTO Client { get; set; }
}