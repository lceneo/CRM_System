using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using API.Modules.ProfilesModule.Entities;
using AutoMapper;

namespace API.Modules.ChatsModule.Mapping;

public class ChatsMapping : Profile
{
    public ChatsMapping()
    {
        CreateMap<ChatEntity, ChatOutDTO>()
            .ForMember(dest => dest.LastMessage,
                opt => opt.MapFrom(src => src.Messages.OrderBy(m => m.DateTime).LastOrDefault()))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(GetChatName))
            .ForMember(dest => dest.Profiles, opt => opt.MapFrom(src => src.Profiles))
            .ForMember(dest => dest.UnreadMessagesCount, opt => opt.MapFrom(MapUnreadsCount));
    }

    private string GetChatName(ChatEntity src, ChatOutDTO dest, string _, ResolutionContext context)
    {
        ProfileEntity? profile = null;
        if (src.Profiles.Count == 1)
            profile = src.Profiles.First();
        if (src.Profiles.Count == 2)
            profile = src.Profiles.First(e => e.Id != (Guid) context.Items["userId"]);
        return profile != null
            ? $"{profile.Surname} {profile.Name}"
            : src.Name;
    }

    private int MapUnreadsCount(
        ChatEntity src,
        ChatOutDTO dest,
        int _,
        ResolutionContext context)
    {
        Guid? userId = null;
        if (context.Items.TryGetValue("userId", out var userIdObj))
        {
            userId = (Guid) userIdObj;
        }
        
        return src
            .Messages
            .Count(m => m.Checks == null 
                        || m.Checks.All(c => userId == null || c.Id != userId));
    }
}