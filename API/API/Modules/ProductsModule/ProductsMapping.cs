using API.Modules.ProductsModule.DTO;
using API.Modules.ProductsModule.Requests;
using AutoMapper;

namespace API.Modules.ProductsModule;

public class ProductsMapping : Profile
{
    public ProductsMapping()
    {
        CreateMap<CreateOrUpdateProductRequest, ProductEntity>()
            .ForAllMembers(opt => opt.Condition((src, dest, curSrc) => curSrc != null));
        CreateMap<ProductEntity, ProductFullDTO>()
            .ForMember(dest => dest.TaskIds, opt => opt.MapFrom(src => src.Tasks.Select(t => t.Id)));
        CreateMap<ProductEntity, ProductDTO>();
        CreateMap<ProductEntity, ProductEntity>();
    }
}