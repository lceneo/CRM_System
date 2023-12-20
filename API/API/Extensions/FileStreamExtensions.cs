namespace API.Extensions;

public static class FileStreamExtensions
{
    public static string ReadAll(this FileStream fileInfo)
        => string.Join(Environment.NewLine, ReadEnum(fileInfo));

    private static IEnumerable<string> ReadEnum(FileStream fileStream)
    {
        using (var reader = new StreamReader(fileStream))
        {
            string line;
            while ((line = reader.ReadLine()) != null)
            {
                yield return line;
            }
        }
    }
}