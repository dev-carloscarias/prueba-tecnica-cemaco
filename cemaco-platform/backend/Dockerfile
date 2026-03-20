FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY CemacoPlatform.sln ./
COPY src/CemacoPlatform.Domain/CemacoPlatform.Domain.csproj src/CemacoPlatform.Domain/
COPY src/CemacoPlatform.Application/CemacoPlatform.Application.csproj src/CemacoPlatform.Application/
COPY src/CemacoPlatform.Infrastructure/CemacoPlatform.Infrastructure.csproj src/CemacoPlatform.Infrastructure/
COPY src/CemacoPlatform.API/CemacoPlatform.API.csproj src/CemacoPlatform.API/

RUN dotnet restore src/CemacoPlatform.API/CemacoPlatform.API.csproj

COPY src/ ./src/
RUN dotnet publish src/CemacoPlatform.API/CemacoPlatform.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 8080
ENTRYPOINT ["dotnet", "CemacoPlatform.API.dll"]
