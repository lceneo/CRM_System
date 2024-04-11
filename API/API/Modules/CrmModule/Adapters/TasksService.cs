using System.Text.Json;
using API.Infrastructure;
using API.Infrastructure.BaseApiDTOs;
using API.Modules.CrmModule.DTO;
using API.Modules.CrmModule.Entities;
using API.Modules.CrmModule.Models;
using API.Modules.CrmModule.Ports;
using API.Modules.LogsModule;
using API.Modules.ProfilesModule.Ports;
using AutoMapper;

namespace API.Modules.CrmModule.Adapters;

public class TasksService : ITasksService
{
    private readonly ILog log;
    private readonly IMapper mapper;
    private readonly ITasksRepository tasksRepository;
    private readonly IProfilesRepository profilesRepository;

    public TasksService(ILog log, IMapper mapper, ITasksRepository tasksRepository, IProfilesRepository profilesRepository)
    {
        this.log = log;
        this.mapper = mapper;
        this.tasksRepository = tasksRepository;
        this.profilesRepository = profilesRepository;
    }

    public async Task<Result<CreateResponse<Guid>>> CreateOrUpdateTask(CreateOrUpdateTaskRequest request, Guid initiatedBy)
    {
        var initiator = await profilesRepository.GetByIdAsync(initiatedBy);
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
            Initiator = initiator,
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