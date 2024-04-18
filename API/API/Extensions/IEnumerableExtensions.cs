namespace API.Extensions;

public static class IEnumerableExtensions
{
    public static string LogExpression<T>(this IEnumerable<T> enumerable)
        => string.Join(", ", enumerable);

    public static TimeSpan? Average(this IEnumerable<TimeSpan?> enumerable)
    {
        var (total, totalCount) = (new TimeSpan(), 0);
        foreach (var timeSpan in enumerable)
        {
            if (timeSpan == null)
                continue;
            total += timeSpan.Value;
            totalCount++;
        }

        return total.Ticks != 0 
            ? total / totalCount
            : null;
    }
}