using System.Runtime.InteropServices.ComTypes;
using API.DAL;
using API.DAL.Repository;
using API.Modules.StaticModule.Entities;
using API.Modules.StaticModule.Ports;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.StaticModule.Adapters;

public class StaticsRepository : CRUDRepository<FileEntity>, IStaticsRepository
{
    public StaticsRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    public async Task<FileEntity?> Get(Guid userId, string fileKey)
    {
        var existed = await Set
            .FirstOrDefaultAsync(e => e.FileKey == fileKey);
        
        return existed;
    }

    public IEnumerable<FileEntity> Get(IEnumerable<string> fileKeys)
    {
        var keys = fileKeys.ToHashSet();
        return Set
            .Where(f => keys.Contains(f.FileKey) && f.Message == null);
    }
}