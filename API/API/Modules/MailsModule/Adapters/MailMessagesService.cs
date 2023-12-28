using System.Net.Mail;
using API.Extensions;
using API.Infrastructure;
using API.Modules.AccountsModule.Ports;
using API.Modules.MailsModule.Models;
using API.Modules.MailsModule.Ports;

namespace API.Modules.MailsModule.Adapters;

public class MailMessagesService : IMailMessagesService
{
    private readonly ILoggedSmtpClient smtpClient;
    private readonly IAccountsRepository accountsRepository;

    public MailMessagesService(
        ILoggedSmtpClient smtpClient,
        IAccountsRepository accountsRepository)
    {
        this.smtpClient = smtpClient;
        this.accountsRepository = accountsRepository;
    }

    public async Task SendPasswordRecovery(string login)
    {
        var account = await accountsRepository.GetByLoginAsync(login);
        if (account == null)
            return;

        account.PasswordHash = null;
        await accountsRepository.UpdateAsync(account);
        
        var pattern = MailPatterns.PasswordRecoveryPattern;
        var messageBody = pattern.FormatWith(new()
        {
            {"login", login},
            {"url", @"https://" + Config.Host + @"/Accounts/Password/Recover"}
        });

        SendMailsAsync("Восстановление пароля", messageBody, account.Email);
    }

    public async Task SendVerificationAsync(string login)
    {
        var account = await accountsRepository.GetByLoginAsync(login);
        if (account == null)
            return;

        var pattern = MailPatterns.VerificationPattern;
        var messageBody = pattern.FormatWith(new()
        {
            {"login", login},
            {"host", Config.Host},
            {"url", @"https://" + Config.Host + @"/Accounts/Password/" + account.Id}
        });

        SendMailsAsync("Подтверждение аккаунта", messageBody, account.Email);
    }

    public void SendMailsAsync(string title, string message, params string[] recipients)
    {
        var mailMessage = new MailMessage
        {
            Subject = title,
            Body = message,
            IsBodyHtml = true,
        };
        foreach (var recipient in recipients)
            mailMessage.To.Add(recipient);

        smtpClient.SendAsync(mailMessage);
    }
}