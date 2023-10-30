using System.Text;

namespace API.Extensions;

public static class StringExtensions
{
    public static string FormatWith(this string format, Dictionary<string, object> values)
    {
        var builder = new StringBuilder(format);
        foreach (var pair in values)
            builder.Replace($"{{{pair.Key}}}", pair.Value.ToString());

        return builder.ToString();
    }
}