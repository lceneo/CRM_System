using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
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
            .ForMember(dest => dest.Files, opt => opt.MapFrom(src => src.Files));
    }
}