using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.ApiDTO;
using API.Modules.ChatsModule.Entities;

namespace API.Modules.ChatsModule.Ports;

public interface IMessagesRepository : ICRUDRepository<MessageEntity>
{
    [Obsolete("Use with chatId in req")]
    SearchResponseBaseDTO<MessageEntity> Search(Guid chatId, MessagesSearchRequest request, bool asTracking = false);
    SearchResponseBaseDTO<MessageEntity> Search(MessagesSearchRequest request, bool asTracking = false);

}