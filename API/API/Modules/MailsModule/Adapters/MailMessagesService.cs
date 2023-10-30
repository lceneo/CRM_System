using System.Net.Mail;
using System.Text;
using API.Extensions;
using API.Infrastructure;
using API.Modules.AccountsModule.Ports;
using API.Modules.MailsModule.Models;
using API.Modules.MailsModule.Ports;

namespace API.Modules.MailsModule.Adapters;

public class MailMessagesService : IMailMessagesService
{
    private readonly Config config;
    private readonly ILoggedSmtpClient smtpClient;
    private readonly IAccountsRepository accountsRepository;

    public MailMessagesService(Config config,
        ILoggedSmtpClient smtpClient, 
        IAccountsRepository accountsRepository)
    {
        this.config = config;
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
        var messageBody = pattern.FormatWith(new(){
            {"login", login},
            {"url", config.Host + @"/Accounts/Password/" + account.Id}});

        SendMailsAsync("Восстановление пароля", messageBody, account.Email);
    }

    public async Task SendVerificationAsync(string login)
    {
        var account = await accountsRepository.GetByLoginAsync(login);
        if (account == null)
            return;
        
        var pattern = MailPatterns.VerificationPattern;
        var messageBody = pattern.FormatWith(new(){
            {"login", login},
            {"host", config.Host},
            {"url", config.Host + @"/Accounts/Password/" + account.Id}});
        
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