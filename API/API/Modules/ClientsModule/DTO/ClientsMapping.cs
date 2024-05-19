using API.Modules.ClientsModule.Requests;
using AutoMapper;

namespace API.Modules.ClientsModule.DTO;
 
public class ClientsMapping : Profile
{
    public ClientsMapping()
    {
        CreateMap<ClientEntity, ClientDTO>();
        CreateMap<CreateOrUpdateClientRequest, ClientEntity>();
    }
}