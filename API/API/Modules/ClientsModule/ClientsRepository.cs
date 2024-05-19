using API.DAL;
using API.DAL.Repository;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ClientsModule.Requests;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.ClientsModule;

public interface IClientsRepository : ICRUDRepository<ClientEntity>
{
    Task<SearchResponseBaseDTO<ClientEntity>> Search(SearchClientsRequest request);
}

public class ClientsRepository : CRUDRepository<ClientEntity>, IClientsRepository
{
    public ClientsRepository(DataContext dataContext, IMapper mapper) : base(dataContext, mapper)
    {
    }

    private IQueryable<ClientEntity> IncludedSet => Set
        .AsQueryable();

    public async Task<ClientEntity?> GetByIdAsync(Guid id) =>
        (await Search(new SearchClientsRequest() {Ids = new HashSet<Guid>() {id}})).Items.FirstOrDefault();

    public async Task<SearchResponseBaseDTO<ClientEntity>> Search(SearchClientsRequest request)
    {
        var query = IncludedSet;

        if (request.Ids?.Any() is true)
            query = query.Where(c => request.Ids.Contains(c.Id));
        if (request.Surname != null)
            query = query.Where(c => c.Surname == request.Surname);
        if (request.Name != null)
            query = query.Where(c => c.Name.Contains(request.Name));
        if (request.Patronymic != null)
            query = query.Where(c => c.Patronymic != null && c.Patronymic.Contains(request.Patronymic));
        if (request.Email != null)
            query = query.Where(c => c.Email != null && c.Email.Contains(request.Email));
        if (request.Phone != null)
            query = query.Where(c => c.Phone != null && c.Phone.Contains(request.Phone));
        if (request.Description != null)
            query = query.Where(c => c.Description != null && c.Description.Contains(request.Description));

        var totalCount = query.Count();
        var items = await query
            .Skip(request.Skip)
            .Take(request.Take)
            .ToListAsync();
        return new SearchResponseBaseDTO<ClientEntity>
        {
            Items = items,
            TotalCount = totalCount
        };
    }
}