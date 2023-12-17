namespace API.Modules.StaticModule.Models;

public class DownloadRequest
{
    public string FileName { get; set; }
}

public class UploadResponse
{
    public string FileKey { get; set; }
}