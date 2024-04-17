using API.Modules.RatingModule.DTO;
using API.Modules.RatingModule.Entities;
using AutoMapper;

namespace API.Modules.RatingModule;

public class RatingMapping : Profile
{
    public RatingMapping()
    {
        CreateMap<RatingEntity, RatingOutDTO>()
            .ForMember(e => e.Manager, opt => opt.MapFrom(src => src.Manager));
    }
}