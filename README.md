# Ethereum Testnet with Nethermind on GCP

This project sets up an Ethereum testnet using Nethermind nodes orchestrated with Helm charts on Google Cloud Platform. It includes a bootnode and multiple mining nodes.

## Prerequisites

- Google Cloud Platform account
- Terraform
- Google Cloud SDK
- Helm
- kubectl

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

### 1. Deploy GCP Infrastructure with Terraform

First, configure your GCP project information in terraform/terraform.tfvars:

```bash
# Set up authentication to GCP
gcloud auth application-default login

# Navigate to the terraform directory
cd terraform

# Initialize Terraform
terraform init

# Review the infrastructure plan
terraform plan

# Deploy the infrastructure
terraform apply
```

This will create:
- A GKE cluster
- Required networking components
- IAM roles and service accounts
- Artifact Registry for container images
- GCP Workload Identity Federation path to be configured as secrets for GitHub actions to authenticate to GKE

### 2. Configure kubectl

After Terraform successfully creates the infrastructure, configure kubectl:

```bash
gcloud container clusters get-credentials <your-cluster-name> --region $(terraform output -raw region) --project $(terraform output -raw project_id)
```

### 3. CI/CD Pipeline Deployment

The project uses GitHub Actions for CI/CD. The pipeline automatically:

1. Builds the Nethermind Docker image and pushes it to GCP Artifact Registry
2. Updates the Helm chart values.yaml with the new image tag
3. Deploys or updates the Nethermind network on the GKE cluster

When you push changes to the main branch, the workflow in `.github/workflows/deploy.yaml` will:
- Build and push the Nethermind container image
- Update the Helm values.yaml with the new image tag
- Check if a Nethermind release already exists in the cluster
- If it exists, perform a `helm upgrade`
- If not, create a new release with `helm install`

The deployment uses the following parameters:
```
helm install nethermind ${{ env.HELM_CHART_PATH }} \
  --namespace nethermind \
  --wait \
  --timeout 10m \
  --atomic
```

**Note:** Manual deployment is generally not needed since the CI/CD pipeline handles it automatically.

## Network Details

- Network ID: 1337
- Chain ID: 11155111 (Sepolia testnet)
- RPC Endpoint: Access via port forwarding or kubectl exec
- Mining Nodes: 2 (configurable)
- Bootnode: 1
- Kubernetes Namespace: nethermind

## Smart Contract Testing

This project includes comprehensive guides for testing your smart contracts on the Nethermind network.

### Testing Guides Overview

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| [TEST_GUIDE.md](nethermind/TEST_GUIDE.md) | General testing workflow from local development to production | Start here for an overview of the testing process |
| [WALLET_GUIDE.md](nethermind/WALLET_GUIDE.md) | Comprehensive wallet setup and obtaining ETH for gas | Use when you need help with wallets and getting test ETH |

### Getting Started with Testing

1. **First, review [TEST_GUIDE.md](nethermind/TEST_GUIDE.md)** for:
   - Understanding the overall testing workflow
   - Setting up your local development environment
   - Learning about the available testing tools
   - Seeing the recommended testing sequence

2. **Refer to [WALLET_GUIDE.md](nethermind/WALLET_GUIDE.md) if you need help with:**
   - Understanding wallets and gas fees
   - Setting up MetaMask or using Hardhat wallets
   - Obtaining test ETH on Sepolia testnet
   - Transferring ETH between accounts
   - Troubleshooting wallet or funding issues

### Quick Testing Steps

For the impatient, here's a quick path to testing:

```bash
# Navigate to the nethermind directory
cd nethermind

# 1. Install dependencies
npm install

# 2. Local testing
npx hardhat test

# 3. Testing on GCP cluster (using port forwarding)
./scripts/port-forward.sh  # In one terminal
npx hardhat run scripts/deploy.js --network gcp  # In another terminal
```

For more detailed instructions, refer to the dedicated testing guides.

## Project Improvements

### 1. Comprehensive Documentation

I have created a detailed documentation system to make this project accessible to developers of all experience levels:

- **TEST_GUIDE.md**: General testing workflow with a clear sequence of steps
- **WALLET_GUIDE.md**: Detailed wallet setup and funding instructions

### 2. Enhanced Testing Scripts

I have developed several scripts to simplify testing and interaction:

- **port-forward.sh**: Creates a secure tunnel to your Kubernetes cluster
- **kubectl-rpc.sh**: Direct RPC communication with nodes through kubectl
- **check-balance.js**: Displays wallet balances
- **fund-account.js**: Automatically transfers ETH from node accounts to your Hardhat wallet
- **transfer-eth.js**: Easily transfers ETH between wallets
- **print-address.js**: Displays your wallet addresses
- **check-funded-accounts.sh**: Finds pre-funded accounts on your nodes

### 3. Flexible Testing Approaches

The project now supports multiple testing approaches:

- **Port forwarding**: Developer-friendly local testing with Hardhat tools
- **Direct kubectl**: CI/CD-friendly approach that doesn't require port forwarding
- **Multiple funding options**: Various ways to obtain ETH for testing

### 4. Improved Error Handling

I have added comprehensive troubleshooting for common issues:

- **Chain ID mismatches**: Updated configuration for Sepolia testnet (Chain ID 11155111)
- **Insufficient funds**: Multiple approaches to get test ETH
- **Connection issues**: Detailed port forwarding troubleshooting

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

## Clean Up

To destroy the infrastructure and avoid incurring charges:

```bash
cd terraform
terraform destroy
``` 