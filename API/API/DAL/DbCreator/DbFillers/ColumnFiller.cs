using API.Modules.CrmModule.Taskcolumns.Entities;

namespace API.DAL.DbCreator.DbFillers;

public class ColumnFiller : IDbFiller
{
    public static void Fill(DataContext dataContext)
    {
        var columns = dataContext.Columns;

        columns.Add(Column("Новая"));
        columns.Add(Column("В работе"));
        columns.Add(Column("На проверке"));
        columns.Add(Column("Готово"));
    }

    private static int OrderCounter = 0; 
    private static TaskColumnEntity Column(string name)
        => new()
        {
            Name = name,
            Order = OrderCounter++,
        };
}