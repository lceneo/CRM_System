using API.Modules.CrmModule.Comments.DTO;
using API.Modules.CrmModule.Comments.Requests;
using AutoMapper;

namespace API.Modules.CrmModule.Comments;

public class TaskCommentsMapping : Profile
{
    public TaskCommentsMapping()
    {
        CreateMap<CreateOrUpdateTaskCommentRequest, TaskCommentEntity>();
        CreateMap<TaskCommentEntity, TaskCommentEntity>(MemberList.None)
            .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.Text));
        CreateMap<TaskCommentEntity, TaskCommentDTO>()
            .ForMember(dest => dest.Author, opt => opt.MapFrom(src => src.Author));
    }
}