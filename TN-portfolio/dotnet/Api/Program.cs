var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
var app = builder.Build();

app.MapPost("/calc", async (HttpContext ctx) =>{
    using var reader = new StreamReader(ctx.Request.Body);
    var json = await reader.ReadToEndAsync();
    var result = Src.Test.ProcessJson(json);
    return Results.Content(result, "application/json");
});

app.Run();