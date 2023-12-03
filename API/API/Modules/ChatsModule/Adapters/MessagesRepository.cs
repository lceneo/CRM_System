using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.DTO;
using API.Modules.ChatsModule.Entities;
using API.Modules.ChatsModule.Ports;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.ChatsModule.Adapters;

public class MessagesRepository : CRUDRepository<MessageEntity>, IMessagesRepository
{
    public MessagesRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    public SearchResponseBaseDTO<MessageEntity> SearchAsync(Guid chatId, MessagesSearchRequest request)
    {
        var query = Set
            .AsNoTracking()
            .Include(c => c.Sender)
            .Where(m => m.Chat.Id == chatId);

        if (request.MessageIds != null)
            query = query.Where(m => request.MessageIds.Contains(m.Id));
        if (request.Sender != null)
            query = query.Where(m => m.Sender.Id == request.Sender);

        return new SearchResponseBaseDTO<MessageEntity>
        {
            Items = query
                .Skip(request.Skip)
                .Take(request.Take)
                .ToList(),
            TotalCount = query.Count(),
        };
    }
}