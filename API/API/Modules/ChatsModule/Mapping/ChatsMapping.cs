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
        CreateMap<ChatEntity, ChatShortDTO>();
    }

    private string GetChatName(ChatEntity src, ChatOutDTO dest, string _, ResolutionContext context)
    {
        ProfileEntity? profile = null;
        if (src.Name != null)
            return src.Name;
        if (src.Client != null)
            return $"{src.Client.Surname} {src.Client.Name}";
        if (src.Profiles.Count == 0)
            return "Не задано";
        if (src.Profiles.Count == 1)
            profile = src.Profiles.First();
        if (src.Profiles.Count == 2)
            profile = src.Profiles.First(e => e.Id != (Guid) context.Items["userId"]);
        return $"{profile.Surname} {profile.Name}";
    }

    private int MapUnreadsCount(
        ChatEntity src,
        ChatOutDTO dest,
        int _,
        ResolutionContext context)
    {
        Guid? userId = null;
        if (context.TryGetItems(out var items) && items.TryGetValue("userId", out var userIdObj))
        {
            userId = (Guid) userIdObj;
        }
        
        return src
            .Messages
            .Where(m => m.Sender?.Id != userId || m.Sender == null)
            .Count(m => m.Checks == null 
                        || userId == null
                        || m.Checks.All(c => c.Profile.Id != userId));
    }
}