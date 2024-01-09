using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using API.Modules.ProfilesModule.DTO;
using AutoMapper;

namespace API.Modules.ChatsModule.Mapping;

public class MessagesMapping : Profile
{
    public MessagesMapping()
    {
        CreateMap<MessageEntity, MessageInChatDTO>()
            .ForMember(dest => dest.Sender, opt => opt.MapFrom(src => src.Sender))
            .ForMember(dest => dest.Files, opt => opt.MapFrom(src => src.Files));
        CreateMap<MessageEntity, MessageOutDTO>()
            .ForMember(dest => dest.Sender, opt => opt.MapFrom(src => src.Sender))
            .ForMember(dest => dest.ChatId, opt => opt.MapFrom(src => src.Chat.Id))
            .ForMember(dest => dest.Files, opt => opt.MapFrom(src => src.Files))
            .ForMember(dest => dest.Checkers, opt => opt.MapFrom(MapCheckers));
    }

    private IEnumerable<ProfileOutShortDTO>? MapCheckers(
        MessageEntity src,
        MessageOutDTO dest,
        IEnumerable<ProfileOutShortDTO>? _,
        ResolutionContext context)
    {
        Guid? curUser = null;
        if (context.Items.TryGetValue("userId", out var curUserObj))
            curUser = (Guid) curUserObj;
        
        return src.Checks?
                .Where(e => curUser == null || e.Id != curUser)
                .Select(e => new ProfileOutShortDTO
                {
                    Id = e.Id,
                    Name = e.Profile.Name,
                    Surname = e.Profile.Surname,
                });
    }
}