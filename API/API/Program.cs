using System.Reflection;
using API.DAL;
using API.Infrastructure;
using API.Infrastructure.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    opt.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});

// Add Cookie Auth.
StartupBuilder.ConfigureAuthorization(builder.Services, builder.Configuration);

// Register DbContext in DI Container
builder.Services.AddDbContext<DataContext>();

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonConfig.DateOnlyJsonConverter());
    options.JsonSerializerOptions.Converters.Add(new JsonConfig.DateTimeConverter());
});

builder.Services.AddAutoMapper(typeof(BaseMappingProfile));

builder.Services.RegisterModules();
builder.Services.AddSignalR(hubOptions =>
{
    hubOptions.EnableDetailedErrors = true;
    hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(1);
});

builder.Services.AddCors(opt =>
{
    opt.AddPolicy(Config.HubsPolicyName, policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowed(_ => true)
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    app.RegisterMiddlewares();
}

app.UseCors(opt =>
    opt.AllowAnyHeader()
        .AllowAnyMethod()
        .SetIsOriginAllowed(origin => true)
        .AllowCredentials());

app.UseHttpsRedirection();
app.UseWebSockets();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.ConfigureHubs();

app.Run();