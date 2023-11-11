using API.DAL;
using API.DAL.Repository;
using API.Modules.MailsModule.Entities;
using API.Modules.MailsModule.Ports;
using AutoMapper;

namespace API.Modules.MailsModule.Adapters;

public class MailMessagesRepository : CRURepository<MailMessageEntity>, IMailMessagesRepository
{
    public MailMessagesRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }
}