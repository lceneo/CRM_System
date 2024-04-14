using System.ComponentModel.DataAnnotations;
using API.DAL;
using API.Modules.AccountsModule.Entities;
using API.Modules.ChatsModule.Entities;
using API.Modules.CrmModule.Comments;
using API.Modules.CrmModule.Tasks.Entities;
using API.Modules.RatingModule.Entities;

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
    public HashSet<CheckEntity> Checks { get; set; }
    public HashSet<RatingEntity> Rates { get; set; }
    public HashSet<TaskEntity> Tasks { get; set; }
    public HashSet<TaskCommentEntity> TaskComments { get; set; }
    public HashSet<TaskActionEntity> TaskActions { get; set; }
}