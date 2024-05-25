using API.Modules.AccountsModule.Entities;
using API.Modules.ChatsModule.Entities;
using API.Modules.ClientsModule;
using API.Modules.CrmModule.Comments;
using API.Modules.CrmModule.Taskcolumns.Entities;
using API.Modules.CrmModule.Tasks.Entities;
using API.Modules.ProductsModule;
using API.Modules.ProfilesModule.Entities;
using API.Modules.RatingModule.Entities;
using API.Modules.StaticModule.Entities;
using API.Modules.VidjetsModule.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;

namespace API.DAL;

public class DataContext : DbContext
{
    private readonly IConfiguration config;

    public DataContext(DbContextOptions options, IConfiguration config) : base(options)
    {
        this.config = config;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        options.UseNpgsql(Environment.GetEnvironmentVariable("DATABASE_CONNECTION"),
            builder => { builder.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null); });
    }

    public void RecreateDatabase()
    {
        DbCreator.DbCreator.RecreateDbAndFillByBaseEntities(this);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
    }

    public DbSet<AccountEntity> Accounts => Set<AccountEntity>();
    public DbSet<ProfileEntity> Profiles => Set<ProfileEntity>();
    public DbSet<ChatEntity> Chats => Set<ChatEntity>();
    public DbSet<MessageEntity> Messages => Set<MessageEntity>();
    public DbSet<VidjetEntity> Vidjets => Set<VidjetEntity>();
    public DbSet<FileEntity> Files => Set<FileEntity>();
    public DbSet<CheckEntity> Checks => Set<CheckEntity>();
    public DbSet<RatingEntity> Rates => Set<RatingEntity>();
    public DbSet<TaskEntity> Tasks => Set<TaskEntity>();
    public DbSet<TaskActionEntity> TaskActions => Set<TaskActionEntity>();
    public DbSet<TaskCommentEntity> TaskComments => Set<TaskCommentEntity>();
    public DbSet<ProductEntity> Products => Set<ProductEntity>();
    public DbSet<ClientEntity> Clients => Set<ClientEntity>();
    public DbSet<TaskColumnEntity> Columns => Set<TaskColumnEntity>();
}