using Microsoft.Extensions.FileProviders;

namespace API.Modules.StaticModule.ApiModels;

public class DownloadRequest
{
    public string FileKey { get; set; }
}

public class DownloadServiceResponse
{
    public string FileName { get; set; }
    public IFileInfo FileInfo { get; set; }
}

public class DownloadResponse
{
    public string FileName { get; set; }
}