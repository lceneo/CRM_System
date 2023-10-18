namespace API.DAL.DbCreator;

public interface IDbFiller
{
    public static abstract void Fill(DataContext dataContext);
}