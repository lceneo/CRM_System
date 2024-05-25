using System.Text.Json;
using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.ClientsModule;
using API.Modules.CrmModule.Comments;
using API.Modules.CrmModule.Taskcolumns;
using API.Modules.CrmModule.Taskcolumns.Requests;
using API.Modules.CrmModule.Tasks.DTO;
using API.Modules.CrmModule.Tasks.Entities;
using API.Modules.CrmModule.Tasks.Requests;
using API.Modules.LogsModule;
using API.Modules.ProductsModule;
using API.Modules.ProductsModule.Requests;
using API.Modules.ProfilesModule.Ports;
using AutoMapper;

namespace API.Modules.CrmModule.Tasks;

public interface ITasksService
{
    Task<Result<CreateResponse<Guid>>> CreateOrUpdateTask(CreateOrUpdateTaskRequest request, Guid userId);
    Task<Result<SearchResponseBaseDTO<TaskDTO>>> SearchTasks(SearchTasksRequest request);
    Task<Result<bool>> DeleteTask(Guid taskId);
}

public class TasksService : ITasksService
{
    private readonly ILog log;
    private readonly IMapper mapper;
    private readonly ITasksRepository tasksRepository;
    private readonly IProfilesRepository profilesRepository;
    private readonly IProductsRepository productsRepository;
    private readonly IClientsRepository clientsRepository;
    private readonly ITaskColumnsRepository columnsRepository;

    public TasksService(ILog log, IMapper mapper, ITasksRepository tasksRepository, IProfilesRepository profilesRepository, IProductsRepository productsRepository, IClientsRepository clientsRepository, ITaskColumnsRepository columnsRepository)
    {
        this.log = log;
        this.mapper = mapper;
        this.tasksRepository = tasksRepository;
        this.profilesRepository = profilesRepository;
        this.productsRepository = productsRepository;
        this.clientsRepository = clientsRepository;
        this.columnsRepository = columnsRepository;
    }

    public async Task<Result<CreateResponse<Guid>>> CreateOrUpdateTask(CreateOrUpdateTaskRequest request, Guid userId)
    {
        var initiator = await profilesRepository.GetByIdAsync(userId);
        if (initiator == null)
            return Result.NotFound<CreateResponse<Guid>>("Пользователя-инициатора не существует");

        TaskEntity? task = null;
        if (request.Id != null)
        {
            task = await tasksRepository.GetByIdAsync(request.Id.Value);
            if (task == null)
                return Result.NotFound<CreateResponse<Guid>>("Такой задачи не существует");
        }
        

        var isCreated = request.Id == null;
        task ??= new TaskEntity
        {
            Actions = new HashSet<TaskActionEntity>(),
            Comments = new HashSet<TaskCommentEntity>(),
        };
        mapper.Map(request, task);
        task.Actions.Add(new TaskActionEntity
        {
            User = initiator,
            DateTime = DateTime.Now.ToUniversalTime(),
        });
        if (request.AssignedTo != null)
        {
            var assignedTo = request.AssignedTo != Guid.Empty 
                ? await profilesRepository.GetByIdAsync(request.AssignedTo.Value) 
                : null;
            if (assignedTo == null && request.AssignedTo != Guid.Empty)
                return Result.NotFound<CreateResponse<Guid>>("Пользователя, на которого хотите назначить задачу, не существует");

            task.AssignedTo = assignedTo;
        }
        if (request.ColumnId != null)
        {
            var columnSearch = request.ColumnId != Guid.Empty
                ? await columnsRepository.Search(new SearchTaskColumnsRequest() {Ids = new HashSet<Guid>() {request.ColumnId.Value}})
                : null;
            if (columnSearch.TotalCount == 0)
                return Result.NotFound<CreateResponse<Guid>>("Колонки для задачи не существует");

            task.Column = columnSearch.Items.First();
        }
        if (request.ProductIds != null)
        {
            var products = !request.ProductIds.Any()
                ? new HashSet<ProductEntity>()
                : request.ProductIds
                    .Select(productId => productsRepository.GetByIdAsync(productId, false).GetAwaiter().GetResult())
                    .ToHashSet()!;
            if (products.Count != request.ProductIds.Count())
                return Result.BadRequest<CreateResponse<Guid>>("Таких продуктов не существует");
            task.Products = products!;
        }
        if (request.ClientId != null)
        {
            var client = request.ClientId != Guid.Empty 
                ? await clientsRepository.GetByIdAsync(request.ClientId.Value)
                : null;
            if (client == null && request.ClientId != Guid.Empty)
                return Result.NotFound<CreateResponse<Guid>>("Клиента, которого вы хотите связать с задачей не существует");

            task.Client = client!;
        }
        
        await tasksRepository.CreateOrUpdateAsync(task);
        await log.Info($"POST Task isCreated: {isCreated} task: {task.Id}");

        return Result.Ok(new CreateResponse<Guid>
        {
            Id = task.Id,
            IsCreated = isCreated
        });
    }

    public async Task<Result<SearchResponseBaseDTO<TaskDTO>>> SearchTasks(SearchTasksRequest request)
    {
        var result = await tasksRepository.Search(request);

        await log.Info($"Found {result.TotalCount} tasks by request: {JsonSerializer.Serialize(request)}");
        return Result.Ok(new SearchResponseBaseDTO<TaskDTO>
        {
            Items = mapper.Map<List<TaskDTO>>(result.Items),
            TotalCount = result.TotalCount,
        });
    }

    public async Task<Result<bool>> DeleteTask(Guid taskId)
    {
        await tasksRepository.DeleteAsync(taskId);
        return Result.Ok(true);
    }
}