Project ATM App
1. .NET Core, Entity Framework Core(EF Core), MySQL, ORM va tich hop Swagger.
2. cài đặt môi trường 
- dotnet add package Microsoft.EntityFrameworkCore
- dotnet add package Microsoft.EntityFrameworkCore.Tools
- dotnet add package Pomelo.EntityFrameworkCore.MySql
 hoặc - dotnet add package Microsoft.EntityFrameworkCore.SqlServer

tích hợp Swagger viet tài liệu API cho consumer
- dotnet add package Swashbuckle.AspNetCore

3. thực hiện Migration và tạo CSDL
- dotnet ef migrations add InitialCreate (ngược lại : dotnet restore)
- dotnet ef database update
- dotnet run
