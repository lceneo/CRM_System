using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.Ports;

public interface IMessagesRepository : ICRUDRepository<MessageEntity>
{
    SearchResponseBaseDTO<MessageEntity> Search(Guid chatId, MessagesSearchRequest request, bool asTracking = false);
}