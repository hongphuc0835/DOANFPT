using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using paymentservice.Payments;
using paymentservice.Services;
using System.Text;
using paymentservice.Data;



var builder = WebApplication.CreateBuilder(args);
// Thêm cấu hình chuỗi kết nối
builder.Services.AddDbContext<APIContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 30))
    ));

builder.Services.AddHttpClient();


// Thêm Authorization Policies
// builder.Services.AddAuthorization(options =>
// {
//     options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
//     options.AddPolicy("UserOnly", policy => policy.RequireRole("User"));
//     options.AddPolicy("AdminOrUser", policy => policy.RequireRole("Admin", "User"));
// }); 


// cau hinh paypal 
builder.Services.AddSingleton(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    var paypalSettings = configuration.GetSection("PayPalSettings");
    return new PaypalClient(
        paypalSettings["ClientId"],
        paypalSettings["ClientSecret"],
        paypalSettings["Mode"]
    );
});

// Thêm CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001") // Cập nhật URL ứng dụng React
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Cấu hình Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "paymentservice", Version = "v1" });

    // Cấu hình JWT trong Swagger
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

// Đăng ký dịch vụ IMemoryCache
builder.Services.AddMemoryCache();

// Đăng ký các dịch vụ trong DI container
builder.Services.AddScoped<PaypalService>();

// Thêm Controllers
builder.Services.AddControllers();

var app = builder.Build();

// Seed dữ liệu Roles vào cơ sở dữ liệu

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
