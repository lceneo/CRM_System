using API.DAL;
using API.Modules.MailsModule.Entities;

namespace API.Modules.MailsModule.Ports;

public interface IMailMessagesRepository : ICRURepository<MailMessageEntity>
{
}