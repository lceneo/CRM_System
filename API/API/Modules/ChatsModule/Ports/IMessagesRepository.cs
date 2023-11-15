using API.DAL.Repository;
using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.Ports;

public interface IMessagesRepository : ICRUDRepository<MessageEntity>
{
}