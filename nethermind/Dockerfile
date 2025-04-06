FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Install dependencies
RUN apt-get update && \
    apt-get install -y git libsnappy-dev libc6-dev libc6 unzip && \
    rm -rf /var/lib/apt/lists/*

# Clone Nethermind repository
RUN git clone https://github.com/NethermindEth/nethermind.git --recursive
WORKDIR /nethermind

# Build Nethermind
RUN dotnet build src/Nethermind/Nethermind.Runner/Nethermind.Runner.csproj -c Release
RUN dotnet publish src/Nethermind/Nethermind.Runner/Nethermind.Runner.csproj -c Release -o /app

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
