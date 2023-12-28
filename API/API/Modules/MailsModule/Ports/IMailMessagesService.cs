namespace API.Modules.MailsModule.Ports;

public interface IMailMessagesService
{
    Task SendPasswordRecovery(string login, Guid recoverId);
    Task SendVerificationAsync(string login);
    void SendMailsAsync(string title, string message, params string[] recipients);
}