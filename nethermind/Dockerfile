FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Install dependencies
RUN apt-get update && \
    apt-get install -y git libsnappy-dev libc6-dev libc6 unzip && \
    rm -rf /var/lib/apt/lists/*

# Clone Nethermind repository
RUN git clone --depth 1 https://github.com/NethermindEth/nethermind.git /nethermind && \
    cd /nethermind && \
    git submodule update --init --recursive

WORKDIR /nethermind

# Debug: List directory contents
RUN ls -la /nethermind/src/Nethermind/

# Build Nethermind
RUN dotnet restore src/Nethermind/Nethermind.sln && \
    dotnet build src/Nethermind/Nethermind.sln -c Release && \
    dotnet publish src/Nethermind/Nethermind.Runner/Nethermind.Runner.csproj -c Release -o /app

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y libsnappy-dev libc6-dev libc6 && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy the published application
COPY --from=build /app .

# Create necessary directories
RUN mkdir -p /app/Data /app/logs /app/keystore

# Expose ports
EXPOSE 8545 30303

# Set the entrypoint
ENTRYPOINT ["dotnet", "Nethermind.Runner.dll"]
