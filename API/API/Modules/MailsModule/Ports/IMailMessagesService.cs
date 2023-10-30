namespace API.Modules.MailsModule.Ports;

public interface IMailMessagesService
{
    Task SendPasswordRecovery(string login);
    Task SendVerificationAsync(string login, Guid userId);
    void SendMailsAsync(string title, string message, params string[] recipients);
}