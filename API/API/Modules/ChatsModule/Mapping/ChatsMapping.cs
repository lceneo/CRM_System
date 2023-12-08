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
                opt => opt.MapFrom(src => src.Messages.OrderBy(m => m.DateTime).LastOrDefault()))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(GetChatName));
    }

    private string GetChatName(ChatEntity src, ChatOutDTO dest, string _, ResolutionContext context)
    {
        return src.Profiles.Count switch
        {
            1 => src.Profiles.First().Name,
            2 => src.Profiles.First(e => e.Id != (Guid) context.Items["userId"]).Name,
            _ => src.Name,
        };
    }
}