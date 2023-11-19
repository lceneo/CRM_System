using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using AutoMapper;

namespace API.Modules.ChatsModule.Mapping;

public class MessagesMapping : Profile
{
    public MessagesMapping()
    {
        CreateMap<MessageEntity, MessageInChatDTO>()
            .ForMember(dest => dest.Sender, opt => opt.MapFrom(src => src.Sender));
        CreateMap<MessageEntity, MessageOutDTO>()
            .ForMember(dest => dest.SenderId, opt => opt.MapFrom(src => src.Sender.Id))
            .ForMember(dest => dest.ChatId, opt => opt.MapFrom(src => src.Chat.Id));
    }
}