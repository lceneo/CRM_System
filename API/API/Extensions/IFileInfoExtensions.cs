using Microsoft.Extensions.FileProviders;

namespace API.Extensions;

public static class IFileInfoExtensions
{
    public static string ReadAll(this IFileInfo fileInfo)
        => string.Join("", ReadEnum(fileInfo));

    private static IEnumerable<string> ReadEnum(IFileInfo fileInfo)
    {
        using (var stream = fileInfo.CreateReadStream())
        using (var reader = new StreamReader(stream))
        {
            string line;
            while ((line = reader.ReadLine()) != null)
            {
                yield return line;
            }
        }
    }
}