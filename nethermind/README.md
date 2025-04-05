# Local Ethereum Testnet with Nethermind

This project sets up a local Ethereum testnet using Nethermind nodes orchestrated with Helm charts. It includes a bootnode and two mining nodes.

## Prerequisites

- Docker
- Kubernetes cluster (e.g., minikube, kind)
- Helm
- Node.js and npm

## Node Types

This setup includes two types of Ethereum nodes:

### Bootnode
A bootnode serves as an entry point for peer discovery in the Ethereum network. It:
- Helps new nodes discover peers and join the network
- Maintains a directory of network participants
- Does not mine blocks or process transactions
- Requires fewer resources than mining nodes

### Miner Nodes
Miner nodes are responsible for the actual work of maintaining the blockchain. They:
- Create new blocks and include transactions
- Validate transactions and enforce consensus rules
- Earn block rewards (in a production network)
- Require more computational resources
- Maintain a full copy of the blockchain

### In our setup:
- The bootnode helps miners find each other on the network
- Miners do the actual work of creating blocks and processing transactions
- Both maintain copies of the blockchain, but serve different roles in the network's infrastructure

## Setup

1. Build the Nethermind Docker image:

   ### Using Docker Desktop and Minikube
   When using minikube with Docker Desktop, you need to make your locally built Docker image available to minikube:

   Option 1: Point your shell to minikube's Docker daemon, then build the image:
   ```bash
   # Point your terminal to minikube's Docker daemon
   eval $(minikube -p minikube docker-env)
   
   # Now build the image (it will be available directly to minikube)
   docker build -t nethermind .
   ```

   Option 2: Build locally and load into minikube:
   ```bash
   # Build the image with your local Docker
   docker build -t nethermind .
   
   # Save the image to a tar file
   docker save nethermind > nethermind.tar
   
   # Load the image into minikube
   minikube image load nethermind.tar
   ```

   Make sure to set `pullPolicy: Never` in values.yaml if using these methods.

2. Deploy the Ethereum network:
```bash
# The chart will automatically create the nethermind namespace
helm install eth-testnet ./helm/nethermind-network
```

3. Install smart contract dependencies:
```bash
npm install
```

## Deploying Smart Contracts

1. Wait for the network to start (check pod status):
```bash
kubectl get pods -n nethermind
```

2. Deploy the SimpleStorage contract:
```bash
npx hardhat run scripts/deploy.js --network local
```

## Network Details

- Network ID: 1337
- Chain ID: 1337
- RPC Endpoint: http://localhost:8545 (after port-forwarding)
- Mining Nodes: 2
- Bootnode: 1
- Kubernetes Namespace: nethermind

## Port Forwarding

To access the JSON-RPC API locally:
```bash
kubectl port-forward -n nethermind svc/eth-testnet-bootnode 8545:8545
```

## Testing

The network includes a simple storage smart contract for testing. You can interact with it using Hardhat console:
```bash
npx hardhat console --network local
```

## Monitoring

To check the status of your nodes:
```bash
# View all pods in the nethermind namespace
kubectl get pods -n nethermind

# View logs for a specific node
kubectl logs -n nethermind <pod-name>

# View all services
kubectl get svc -n nethermind
``` 