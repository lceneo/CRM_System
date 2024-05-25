using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.Taskcolumns.DTO;
using API.Modules.CrmModule.Taskcolumns.Entities;
using API.Modules.CrmModule.Taskcolumns.Requests;
using AutoMapper;

namespace API.Modules.CrmModule.Taskcolumns;

public interface ITasksColumnsService
{
    Task<Result<SearchResponseBaseDTO<TaskColumnDTO>>> Search(SearchTaskColumnsRequest request);
    Task<Result<CreateResponse>> CreateOrUpdate(CreateOrUpdateTaskColumnRequest request);
    Task<Result<bool>> Delete(Guid columnId);
}

public class TaskColumnsService : ITasksColumnsService
{
    private readonly ITaskColumnsRepository taskColumnsRepository;
    private readonly IMapper mapper;

    public TaskColumnsService(ITaskColumnsRepository taskColumnsRepository, IMapper mapper)
    {
        this.taskColumnsRepository = taskColumnsRepository;
        this.mapper = mapper;
    }

    public async Task<Result<SearchResponseBaseDTO<TaskColumnDTO>>> Search(SearchTaskColumnsRequest request)
    {
        var search = await taskColumnsRepository.Search(request);
        return Result.Ok(new SearchResponseBaseDTO<TaskColumnDTO>
        {
            TotalCount = search.TotalCount,
            Items = mapper.Map<List<TaskColumnDTO>>(search.Items)
        });
    }

    public async Task<Result<CreateResponse>> CreateOrUpdate(CreateOrUpdateTaskColumnRequest request)
    {
        var isCreated = request.Id == null;
        TaskColumnEntity? column = null;
        if (request.Id != null)
        {
            var search = await taskColumnsRepository.Search(new SearchTaskColumnsRequest() {Ids = new() {request.Id.Value}});
            if (search.TotalCount == 0)
                return Result.NotFound<CreateResponse>("Такой колонки не существует");
            column = search.Items.First();
        }

        column ??= new TaskColumnEntity();
        if (request.Name != null)
            column.Name = request.Name;
        if (request.Order != null)
            column.Order = request.Order.Value;

        if (isCreated)
            await taskColumnsRepository.CreateAsync(column);
        await taskColumnsRepository.SaveChangesAsync();
        return Result.Ok(new CreateResponse
        {
            Id = column.Id,
            IsCreated = isCreated
        });
    }

    public async Task<Result<bool>> Delete(Guid columnId)
    {
        await taskColumnsRepository.DeleteAsync(columnId);
        return Result.Ok(true);
    }
}