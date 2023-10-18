using API.Modules.AccountsModule.Models;
using Microsoft.EntityFrameworkCore;

namespace API.DAL;

public class DataContext : DbContext
{
    public DataContext(DbContextOptions options) : base(options)
    {
    }

    public void RecreateDatabase()
    {
        DbCreator.DbCreator.RecreateDbAndFillByBaseEntities(this);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
    }

    public DbSet<AccountEntity> Accounts => Set<AccountEntity>();
}