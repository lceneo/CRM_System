﻿using System.Net;
using System.Net.Mail;
using API.Infrastructure;
using API.Modules.LogsModule;
using API.Modules.MailsModule.Entities;
using API.Modules.MailsModule.Ports;

namespace API.Modules.MailsModule.Adapters;

public class LoggedSmtpClient : ILoggedSmtpClient
{
    private readonly SmtpClient smtpClient;
    private readonly IMailMessagesRepository mailMessagesRepository;
    private readonly ILog log;

    public LoggedSmtpClient(
        IMailMessagesRepository mailMessagesRepository,
        ILog log)
    {
        this.mailMessagesRepository = mailMessagesRepository;
        this.smtpClient = ConfigureSmtpClient();
    }

    public void SendAsync(MailMessage mailMessage)
    {
        mailMessage.IsBodyHtml = true;
        mailMessage.From = new MailAddress(Config.MailBoxLogin);

        smtpClient.SendAsync(mailMessage, null);
    }

    private SmtpClient ConfigureSmtpClient()
    {
        var client = new SmtpClient
        {
            Host = "smtp.mail.ru",
            Port = 587,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(Config.MailBoxLogin, Config.MailBoxPassword),
            EnableSsl = true,
        };

        client.SendCompleted += (e, a) =>
        {
            if (a.Error != null)
            {
                // log.Error(a.Error.Message);
            }
            mailMessagesRepository.CreateAsync(new MailMessageEntity
            {
                Time = DateTime.Now,
                Title = "Test title",
                Error = a.Error?.Message,
            });
        };

        return client;
    }
}