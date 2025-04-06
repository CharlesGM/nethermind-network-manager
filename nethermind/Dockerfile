FROM nethermindeth/nethermind:latest

# Create necessary directories
RUN mkdir -p /nethermind/Data /nethermind/logs /nethermind/keystore

# Expose required ports
# 8545 - JSON-RPC
# 30303 - P2P communication
EXPOSE 8545 30303

# Default command
ENTRYPOINT ["dotnet", "/nethermind/Nethermind.Runner.dll"]
