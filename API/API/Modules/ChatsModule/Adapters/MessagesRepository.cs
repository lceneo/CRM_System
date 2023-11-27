using API.DAL;
using API.DAL.Repository;
using API.Modules.ChatsModule.Entities;
using API.Modules.ChatsModule.Ports;
using AutoMapper;

namespace API.Modules.ChatsModule.Adapters;

public class MessagesRepository : CRUDRepository<MessageEntity>, IMessagesRepository
{
    public MessagesRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }
}