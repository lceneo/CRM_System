using API.Modules.CrmModule.DTO;
using API.Modules.CrmModule.Entities;
using API.Modules.CrmModule.Models;
using AutoMapper;

namespace API.Modules.CrmModule.Mapping;

public class TasksMapping : Profile
{
    public TasksMapping()
    {
        CreateMap<CreateOrUpdateTaskRequest, TaskEntity>()
            .ForMember(dest => dest.AssignedTo, opt => opt.Ignore())
            .ForMember(dest => dest.State, opt => opt.MapFrom((src, dest) => src.State ?? dest.State))
            .ForMember(dest => dest.Descrption, opt => opt.MapFrom((src, dest) => src.Descrption ?? dest.Descrption))
            .ForMember(dest => dest.Title, opt => opt.MapFrom((src, dest) => src.Title ?? dest.Title));
        CreateMap<TaskActionEntity, TaskActionDTO>()
            .ForMember(dest => dest.Initiator, opt => opt.MapFrom(src => src.Initiator));
        CreateMap<TaskCommentEntity, TaskCommentDTO>()
            .ForMember(dest => dest.Author, opt => opt.MapFrom(src => src.Author));
        CreateMap<TaskEntity, TaskDTO>()
            .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedTo))
            .ForMember(dest => dest.Creation, opt => opt.MapFrom(src => src.Actions.First()))
            .ForMember(dest => dest.LastEdition, opt => opt.MapFrom(src => src.Actions.Last()))
            .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments));
    }
}