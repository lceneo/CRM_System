using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using AutoMapper;

namespace API.Modules.ChatsModule.Mapping;

public class ChatsMapping : Profile
{
    public ChatsMapping()
    {
        CreateMap<ChatEntity, ChatOutDTO>()
            .ForMember(dest => dest.LastMessage,
                opt => opt.MapFrom(src => src.Messages.OrderBy(m => m.DateTime).Last()));
    }
}