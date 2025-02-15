﻿using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ChatsModule.ApiDTO;
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

    private IQueryable<MessageEntity> IncludedSet => Set
        .Include(m => m.Chat)
        .Include(m => m.Sender).ThenInclude(s => s.Account)
        .Include(m => m.Files)
        .Include(m => m.Checks).ThenInclude(c => c.Profile)
        .AsQueryable();
    
    public SearchResponseBaseDTO<MessageEntity> Search(Guid chatId, MessagesSearchRequest request, bool asTracking = false)
    {
        request.ChatId = chatId;
        return Search(request, asTracking);
    }

    public SearchResponseBaseDTO<MessageEntity> Search(MessagesSearchRequest request, bool asTracking = false)
    {
        var query = IncludedSet;
        if (!asTracking)
            query = query.AsNoTracking();
        
        if (request.MessageIds != null)
            query = query.Where(m => request.MessageIds.Contains(m.Id));
        if (request.ChatId != null)
            query = query.Where(m => m.Chat.Id == request.ChatId);
        if (request.Sender != null)
            query = query.Where(m => m.Sender != null && m.Sender.Id == request.Sender);
        if (request.Type != null)
            query = query.Where(m => m.Type == request.Type);

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