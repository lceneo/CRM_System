using API.Modules.CrmModule.Taskcolumns.Entities;
using AutoMapper;

namespace API.Modules.CrmModule.Taskcolumns.DTO;

public class TasksColumnMapping : Profile
{
    public TasksColumnMapping()
    {
        CreateMap<TaskColumnEntity, TaskColumnDTO>().ForMember(dest => dest.TasksIds,
            opt => opt.MapFrom(src => src.Tasks == null 
                ? null 
                : src.Tasks.Select(t => t.Id)));
    }
}