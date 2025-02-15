﻿using API.Modules.CrmModule.Tasks.DTO;
using API.Modules.CrmModule.Tasks.Entities;
using API.Modules.CrmModule.Tasks.Requests;
using AutoMapper;

namespace API.Modules.CrmModule.Tasks;

public class TasksMapping : Profile
{
    public TasksMapping()
    {
        CreateMap<CreateOrUpdateTaskRequest, TaskEntity>()
            .ForMember(dest => dest.AssignedTo, opt => opt.Ignore())
            .ForMember(dest => dest.Products, opt => opt.Ignore())
            .ForMember(dest => dest.Column, opt => opt.Ignore())
            .ForMember(dest => dest.Descrption, opt => opt.MapFrom((src, dest) => src.Descrption ?? dest.Descrption))
            .ForMember(dest => dest.Title, opt => opt.MapFrom((src, dest) => src.Title ?? dest.Title))
            .ForMember(dest => dest.Priority, opt => opt.MapFrom((src, dest) => src.Priority ?? dest.Priority));
        CreateMap<TaskActionEntity, TaskActionDTO>()
            .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User));
        CreateMap<TaskEntity, TaskDTO>()
            .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedTo))
            .ForMember(dest => dest.Creation, opt => opt.MapFrom(src => src.Actions.First()))
            .ForMember(dest => dest.Column, opt => opt.MapFrom(src => src.Column))
            .ForMember(dest => dest.LastEdition, opt => opt.MapFrom(src => src.Actions.Last()))
            .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments))
            .ForMember(dest => dest.Products, opt => opt.MapFrom(src => src.Products));
    }
}