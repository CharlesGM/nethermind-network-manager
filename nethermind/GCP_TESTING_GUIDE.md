# Testing Smart Contracts on GCP Kubernetes Cluster

This guide provides detailed, step-by-step instructions for testing your smart contracts on the Nethermind network deployed in your GCP Kubernetes cluster.

## Quick Start
1. Configure kubectl for your GCP cluster
2. Choose testing approach: port forwarding OR direct kubectl access
3. Deploy a contract using the appropriate script
4. Interact with your contract
5. Monitor events (optional)

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured
- `kubectl` configured to access your GCP Kubernetes cluster
- Node.js and npm installed locally
- Smart contracts ready for testing (compiled with `npx hardhat compile`)

## Network Information

Your Nethermind network is running with the following configuration:
- **Chain ID**: 11155111 (Sepolia testnet)
- **Network Namespace**: nethermind
- **JSON-RPC API**: Available on port 8545

## Step 1: Configure Access to Your GCP Cluster

First, make sure your `kubectl` is configured to access your GCP Kubernetes cluster:

```bash
gcloud container clusters get-credentials <your-cluster-name> --region <your-region> --project <your-project-id>
```

Verify the connection to your cluster:

```bash
kubectl cluster-info
```

Verify your Nethermind network is running:

```bash
kubectl get pods -n nethermind
```

You should see pods like `nethermind-bootnode-0` and `nethermind-miner-0`, `nethermind-miner-1`, etc.

## Getting Funds for Transactions

Since your network is using Sepolia testnet (Chain ID 11155111), you'll need ETH to pay for gas fees. If you encounter an "InsufficientFunds" error, you have several options:

### Option 1: Fund Your Account from a Miner Account

The easiest solution is to use the funding script, which transfers ETH from a funded node account to your Hardhat account:

```bash
# Make sure port forwarding is running in another terminal
./scripts/port-forward.sh

# Run the funding script
node scripts/fund-account.js
```

This script will:
1. Find your account address from hardhat.config.js
2. Look for accounts with ETH on your Nethermind nodes
3. Transfer 1 ETH to your account if a funded account is found

### Option 2: Check for Pre-funded Accounts

You can check if there are any pre-funded accounts on your Nethermind nodes:

```bash
./scripts/check-funded-accounts.sh
```

If found, you can update the hardhat.config.js to use these accounts directly.

### Option 3: Get ETH from a Sepolia Faucet

Since you're on Sepolia testnet, you can get test ETH from one of these faucets:

1. **Official Sepolia Faucet**:
   - Visit [sepoliafaucet.com](https://sepoliafaucet.com/)
   - Connect your wallet (MetaMask recommended)
   - Request test ETH

2. **Alchemy Sepolia Faucet**:
   - Visit [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - Enter your wallet address
   - Complete the captcha
   - Receive 0.5 ETH

3. **Infura Sepolia Faucet**:
   - Visit [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - Connect your wallet
   - Request test ETH

4. **PoW Faucet**:
   - Visit [sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de/)
   - Solve a proof-of-work challenge
   - Receive test ETH

To get your address for the faucet:
```bash
npx hardhat run scripts/print-address.js
```

## Choose Your Testing Approach

I provide two approaches for testing smart contracts. Choose the one that works best for your scenario:

| Approach | Best For | Requirements | Complexity |
|----------|----------|--------------|------------|
| Port Forwarding | Development, interactive testing | Local port 8545 available | Simple |
| Direct kubectl | CI/CD, environments where port forwarding isn't possible | kubectl access | Medium |

## Option 1: Testing Using Port Forwarding

This approach creates a local tunnel to your Kubernetes services, allowing Hardhat to connect directly.

### Step 2: Set Up Port Forwarding to Your Nethermind Node

```bash
# Make the script executable if not already
chmod +x scripts/port-forward.sh

# Run the port forwarding script (leave this terminal window open)
./scripts/port-forward.sh
```

This script creates a tunnel from your local port 8545 to the Nethermind service in your cluster.

**Important**: Keep this terminal window open while testing. The port forwarding will stop if you close it.

### Step 3: Deploy a Smart Contract to Your GCP Cluster

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

### Step 4: Interact with Your Deployed Contract

Use the unified interact.js script to interact with your deployed contract:

```bash
export CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
export NEW_VALUE=100  # Optional, defaults to 42
npx hardhat run scripts/interact.js --network gcp
```

### Step 5: Monitor Contract Events

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

### Step 2: Use the Direct RPC Script to Query Blockchain State

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

### Step 3: Deploy and Interact with a Contract Directly

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

## Troubleshooting

### Insufficient Funds Error

If you see "InsufficientFunds, Balance is zero, cannot pay gas" error:

1. You need ETH to pay for gas fees when deploying contracts
2. Use one of the options from the "Getting Funds for Transactions" section
3. Verify your balance with:
   ```bash
   npx hardhat run scripts/check-balance.js --network gcp
   ```

### Chain ID Mismatch

If you see an error like `Hardhat was set to use chain id X, but connected to a chain with id Y`:
1. Make sure your hardhat.config.js has the correct chainId (11155111 for Sepolia) in the gcp network configuration
2. Verify the chain ID your Nethermind network is using:
   ```bash
   ./scripts/kubectl-rpc.sh custom eth_chainId '[]'
   ```

### Port Forwarding Issues

If you encounter issues with port forwarding:

1. Make sure the port forwarding script is still running
2. Check if the port is already in use on your machine:
   ```bash
   lsof -i :8545
   ```
3. You may need to restart the port forwarding if your connection drops

### Connection Issues

If you face connection errors:

1. Verify that the Nethermind pod is running:
   ```bash
   kubectl get pods -n nethermind
   ```

2. Check pod logs for errors:
   ```bash
   kubectl logs -n nethermind <pod-name>
   ```

3. If the connection times out, increase the timeout in hardhat.config.js

### Transaction Failures

If transactions fail:

1. Ensure your account has sufficient ETH for gas
2. Check that your contract is deployed correctly
3. If using the direct approach, try increasing the gas limit in the deploy script

### kubectl-rpc.sh Script Errors

If you encounter issues with the kubectl-rpc.sh script:

1. Make sure curl is installed in the pod
2. Check that the pod has network access to its own localhost
3. Try running a simple command inside the pod directly:
   ```bash
   kubectl exec -n nethermind <pod-name> -- curl -s http://localhost:8545
   ```

## Security Considerations

Remember these security best practices:

1. The private keys in your hardhat.config.js should NEVER be used in production
2. Port forwarding should only be used for development and testing
3. For production access, consider setting up a proper ingress with authentication
4. Monitor your contracts for suspicious activity 