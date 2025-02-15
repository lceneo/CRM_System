﻿using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ClientsModule.DTO;
using API.Modules.ClientsModule.Requests;
using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;

namespace API.Modules.ClientsModule;

public interface IClientsService
{
    Task<Result<SearchResponseBaseDTO<ClientDTO>>> Search(SearchClientsRequest request);
    Task<Result<CreateResponse>> CreateOrUpdateClient(CreateOrUpdateClientRequest request, bool fromHub = false);
    Task<Result<bool>> Delete(Guid clientId);
}

public class ClientsService : IClientsService
{
    private readonly IClientsRepository clientsRepository;
    private readonly IMapper mapper;

    public ClientsService(IClientsRepository clientsRepository, IMapper mapper)
    {
        this.clientsRepository = clientsRepository;
        this.mapper = mapper;
    }


    public async Task<Result<SearchResponseBaseDTO<ClientDTO>>> Search(SearchClientsRequest request)
    {
        var result = await clientsRepository.Search(request);
        return Result.Ok(new SearchResponseBaseDTO<ClientDTO>
        {
            TotalCount = result.TotalCount,
            Items = mapper.Map<List<ClientDTO>>(result.Items),
        });
    }

    public async Task<Result<CreateResponse>> CreateOrUpdateClient(CreateOrUpdateClientRequest request, bool fromHub = false)
    {
        ClientEntity? client = null;
        var isCreated = request.Id == null;
        if (request.Id != null)
        {
            var searchResp = await clientsRepository.Search(new SearchClientsRequest
            {
                Ids = new HashSet<Guid> {request.Id.Value}
            });
            if (searchResp.TotalCount == 0)
                return Result.BadRequest<CreateResponse>("Такого клиента не существует");
            client = searchResp.Items.First();
        }

        if (isCreated && request.Email == null && request.Phone == null)
            return Result.BadRequest<CreateResponse>("Email или телефон обязяателны");
        var existed = await clientsRepository.Search(new SearchClientsRequest()
        {
            Email = request.Email,
            Phone = request.Phone,
        });
        if (existed.TotalCount != 0)
        {
            if (!fromHub)
                return Result.BadRequest<CreateResponse>("Email/телефон уже занят");

            return Result.Ok(new CreateResponse(){IsCreated = false, Id = existed.Items.First().Id});
        }

        client ??= new ClientEntity();
        mapper.Map(request, client);
        if (isCreated)
            await clientsRepository.CreateAsync(client);
        await clientsRepository.SaveChangesAsync();

        return Result.Ok(new CreateResponse
        {
            Id = client.Id,
            IsCreated = isCreated,
        });
    }

    public async Task<Result<bool>> Delete(Guid clientId)
    {
        await clientsRepository.DeleteAsync(clientId);
        return Result.NoContent<bool>();
    }
}