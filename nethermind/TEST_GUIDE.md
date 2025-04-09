# Smart Contract Testing Guide

This guide provides a structured approach to testing your smart contracts, from local development to GCP Kubernetes deployment.

## Testing Workflow Overview

1. **Local Development & Testing** - Start here to develop and test contracts locally
2. **Kubernetes Testing** - Test contracts on your GCP-deployed Ethereum network
3. **Production Deployment** - Deploy contracts to your production environment

## Network Information

- **Local Network**: Uses Hardhat local node with Chain ID 1337
- **GCP Network**: Uses Nethermind with Chain ID 11155111 (Sepolia testnet) 

## 1. Local Development & Testing

### Setup Local Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile your contracts:
   ```bash
   npx hardhat compile
   ```

### Run Automated Tests

Execute the test suite to verify contract functionality:
```bash
npx hardhat test
```

The test files are located in the `test/` directory.

### Interactive Local Testing

1. Start a local Hardhat node in a terminal:
   ```bash
   npx hardhat node
   ```

2. In a separate terminal, deploy and interact with your contract:
   ```bash
   # Deploy a new contract
   npx hardhat run scripts/interact.js --network local
   
   # Or interact with an existing contract
   export CONTRACT_ADDRESS=<previously-deployed-address>
   export NEW_VALUE=123
   npx hardhat run scripts/interact.js --network local
   ```

## 2. Testing on GCP Kubernetes Cluster

Once your local tests pass, you can test on your GCP-deployed Ethereum network.

### Connection Options

Choose one of these methods to connect to your GCP cluster:

1. **Port Forwarding** - Create a tunnel to your cluster for Hardhat tools
2. **Direct kubectl Access** - Interact with blockchain nodes directly through kubectl

### Files to Use

| Purpose | File | Description |
|---------|------|-------------|
| Port Forwarding Setup | `scripts/port-forward.sh` | Creates a local tunnel to your K8s service |
| Contract Deployment | `scripts/deploy.js` | Deploys contracts to the network |
| Contract Interaction | `scripts/interact.js` | Sets/gets values from your contract |
| Event Monitoring | `scripts/listen-events.js` | Listens for contract events |
| Balance Checking | `scripts/check-balance.js` | Checks account balances |
| Direct RPC Access | `scripts/kubectl-rpc.sh` | Direct JSON-RPC calls via kubectl |
| Direct Deployment | `scripts/direct-deploy.js` | Deploys without port forwarding |

## Option 1: Testing Using Port Forwarding

This approach creates a local tunnel to your Kubernetes services, allowing Hardhat to connect directly.

### Step 1: Set Up Port Forwarding to Your Nethermind Node

```bash
# Make the script executable if not already
chmod +x scripts/port-forward.sh

# Run the port forwarding script (leave this terminal window open)
./scripts/port-forward.sh
```

This script creates a tunnel from your local port 8545 to the Nethermind service in your cluster.

**Important**: Keep this terminal window open while testing. The port forwarding will stop if you close it.

### Step 2: Deploy a Smart Contract to Your GCP Cluster

In a new terminal window, deploy your SimpleStorage contract to the Nethermind network:

```bash
cd nethermind  # Ensure you're in the project directory
npx hardhat run scripts/deploy.js --network gcp
```

Example output:
```
SimpleStorage deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Take note of the deployed contract address, you'll need it for the next steps.

### Step 3: Interact with Your Deployed Contract

Use the unified interact.js script to interact with your deployed contract:

```bash
export CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
export NEW_VALUE=100  # Optional, defaults to 42
npx hardhat run scripts/interact.js --network gcp
```

### Step 4: Monitor Contract Events

To monitor events emitted by your contract:

```bash
export CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
npx hardhat run scripts/listen-events.js --network gcp
```

You can trigger a test event by running:

```bash
export CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
export TRIGGER_EVENT=true
npx hardhat run scripts/listen-events.js --network gcp
```

## Option 2: Direct Kubectl Access (No Port Forwarding Required)

This approach interacts directly with the blockchain through kubectl exec commands.

### Step 1: Use the Direct RPC Script to Query Blockchain State

First, check if you can connect to your blockchain:

```bash
# Make the scripts executable if not already
chmod +x scripts/kubectl-rpc.sh

# Get the latest block number
./scripts/kubectl-rpc.sh block

# List available accounts
./scripts/kubectl-rpc.sh accounts
```

Make note of the accounts returned - you'll need these to deploy contracts.

### Step 2: Deploy and Interact with a Contract Directly

The direct-deploy.js script handles both deployment and interaction without port forwarding:

```bash
# Compile the contracts first (if not already done)
npx hardhat compile

# Deploy and interact with the SimpleStorage contract
node scripts/direct-deploy.js
```

This script will:
1. Find available accounts on the blockchain
2. Deploy the SimpleStorage contract
3. Set a value (42)
4. Read the value back
5. Output the contract address for future reference

For example:
```
Contract deployed at address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Common Tasks

### Check Account Balances

#### With Port Forwarding:
```bash
npx hardhat run scripts/check-balance.js --network gcp
```

#### With Direct kubectl:
```bash
./scripts/kubectl-rpc.sh accounts  # List accounts
./scripts/kubectl-rpc.sh balance 0x1234567890123456789012345678901234567890  # Check balance
```

### Verify Transaction Status

When a transaction seems slow or stuck:

```bash
# Using kubectl-rpc.sh
./scripts/kubectl-rpc.sh custom eth_getTransactionReceipt '["0x123..."]'
```

## Getting Test ETH on Sepolia

Since you're using Sepolia testnet, you'll need test ETH to pay for gas fees. Here how to get test ETH:

1. **Google Cloud Web3 Faucet**:
   - Visit [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
   - Sign in with your Google Cloud account
   - Enter your Ethereum address
   - Request test ETH

## Recommended Testing Sequence

1. Start with local testing (`npx hardhat test`)
2. Deploy to a local node (`npx hardhat node` + `scripts/interact.js`)
3. Get test ETH from a Sepolia faucet
4. When ready for cluster testing:
   - Use port forwarding for a developer-friendly experience
   - Or use direct kubectl access in CI/CD environments
5. Monitor events to verify contract behavior
6. After successful testing, deploy to production

## Troubleshooting

- If you encounter RPC connection issues, make sure your service is exposed correctly
- For transaction failures, check that your account has sufficient ETH for gas
- If you see chain ID mismatches, ensure your hardhat.config.js matches the network (Chain ID 1337 for local, 11155111 for Sepolia)
- For port forwarding issues:
  - Make sure the port forwarding script is still running
  - Check if the port is already in use on your machine:
    ```bash
    lsof -i :8545
    ```
  - You may need to restart the port forwarding if your connection drops 