﻿using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.AccountsModule.Models;
using API.Modules.ChatsModule.Entities;
using API.Modules.StaticModule.Entities;

namespace API.Modules.ProfilesModule.Entities;

public class ProfileEntity : IEntity
{
    [Key] public Guid Id { get; set; }
    [Required] public AccountEntity Account { get; set; }
    [Required] public string Surname { get; set; }
    [Required] public string Name { get; set; }
    public string? Patronimic { get; set; }
    public string? About { get; set; }
    public HashSet<ChatEntity> Chats { get; set; }
    public HashSet<MessageEntity> Messages { get; set; }
    public string? StartMessage { get; set; }
    public string? EndMesssage { get; set; }
}