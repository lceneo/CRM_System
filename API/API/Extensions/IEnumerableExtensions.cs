namespace API.Extensions;

public static class IEnumerableExtensions
{
    public static string LogExpression<T>(this IEnumerable<T> enumerable)
        => string.Join(", ", enumerable);
}