using API.Modules.AccountsModule.Models;
using API.Modules.ProfilesModule.Entities;
using Microsoft.EntityFrameworkCore;

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
        options.UseNpgsql(config.GetConnectionString("DefaultConnection"), builder =>
        {
            builder.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
        });
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
}