FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ApiAnaliticaCRM.csproj", "."]
RUN dotnet restore "./ApiAnaliticaCRM.csproj"
COPY . .
RUN find . -path ./src -prune -o -name "*.cs" -print
RUN dotnet publish "ApiAnaliticaCRM.csproj" -c Release -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ApiAnaliticaCRM.dll"]