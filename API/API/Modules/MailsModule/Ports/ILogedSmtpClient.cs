using System.Net.Mail;

namespace API.Modules.MailsModule.Ports;

public interface ILoggedSmtpClient
{
    public void SendAsync(MailMessage mailMessage);
}