namespace API.DAL.DbCreator;

public static class DbCreator
{
    public static void RecreateDbAndFillByBaseEntities(DataContext dataContext)
    {
        dataContext.Database.EnsureDeleted();
        dataContext.Database.EnsureCreated();

        var fillers = typeof(DbCreator).Assembly
            .GetTypes()
            .Where(p => p.IsClass && p.IsAssignableTo(typeof(IDbFiller)));

        var parameters = new[] {dataContext};
        foreach (var filler in fillers)
            filler.GetMethod("Fill").Invoke(null, parameters);
        
        dataContext.SaveChanges();
    }
}