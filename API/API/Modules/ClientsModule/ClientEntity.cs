﻿using API.DAL;
using API.Modules.ChatsModule.Entities;
using API.Modules.CrmModule.Tasks.Entities;
using API.Modules.ProfilesModule.Entities;

namespace API.Modules.ClientsModule;

public class ClientEntity : IEntity
{
    public Guid Id { get; set; }
    public string Surname { get; set; }
    public string Name { get; set; }
    public string? Patronymic { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Description { get; set; }
    public HashSet<TaskEntity>? Tasks { get; set; } = new();
    public HashSet<ChatEntity>? Chats { get; set; } = new();
}