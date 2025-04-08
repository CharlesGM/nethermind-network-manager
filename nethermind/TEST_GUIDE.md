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

### Step-by-Step Testing on GCP

For detailed instructions on testing with your GCP Kubernetes cluster, see [GCP_TESTING_GUIDE.md](GCP_TESTING_GUIDE.md), which covers:

1. Setting up connection to your cluster
2. Testing with port forwarding
3. Direct kubectl access 
4. Monitoring contract events
5. Troubleshooting common issues

## Getting Test ETH on Sepolia

Since you're using Sepolia testnet, you'll need test ETH to pay for gas fees. Here are several ways to get test ETH:

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
- See the full troubleshooting section in [GCP_TESTING_GUIDE.md](GCP_TESTING_GUIDE.md) 