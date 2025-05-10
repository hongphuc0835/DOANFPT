using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using bookingServices.Data;
using bookingServices.Services;
using bookingServices.Implement;

var builder = WebApplication.CreateBuilder(args);

// Thêm cấu hình chuỗi kết nối
builder.Services.AddDbContext<APIContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 30))
    ));



// Cấu hình HttpClient
builder.Services.AddHttpClient("UserService", client =>
{
    client.BaseAddress = new Uri("http://localhost:5119/api/");
});

builder.Services.AddHttpClient("TourService", client =>
{
    client.BaseAddress = new Uri("http://localhost:5089/api/");
});

// Đăng ký các dịch vụ
builder.Services.AddScoped<IBookingService, BookingService>();



// Thêm CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "Http://localhost:3001") // Cập nhật URL ứng dụng React
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Cấu hình Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Bookingservices", Version = "v1" });

    // Thêm cấu hình JWT trong Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập 'Bearer' [khoảng trắng] và sau đó là JWT token. Ví dụ: 'Bearer abcdef12345'"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Đăng ký các dịch vụ trong DI container



// Thêm Controllers
builder.Services.AddControllers();

var app = builder.Build();

// Hiển thị Swagger nếu trong môi trường phát triển
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Sử dụng CORS
app.UseCors("AllowReactApp");

// Sử dụng HTTPS
app.UseHttpsRedirection();

// Sử dụng xác thực
app.UseAuthentication();

// Sử dụng Authorization
app.UseAuthorization();

// Ánh xạ Controllers
app.MapControllers();

// Chạy ứng dụng
app.Run();
