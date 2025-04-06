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

### 2. Configure kubectl

After Terraform successfully creates the infrastructure, configure kubectl:

```bash
gcloud container clusters get-credentials ledgerndary-cluster --region $(terraform output -raw region) --project $(terraform output -raw project_id)
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
- Chain ID: 1337
- RPC Endpoint: Access via GCP Load Balancer (see below)
- Mining Nodes: 2 (configurable)
- Bootnode: 1
- Kubernetes Namespace: nethermind

## Accessing the Network

The bootnode exposes JSON-RPC API through a GCP Load Balancer. To get the endpoint:

```bash
kubectl get svc -n nethermind nethermind-bootnode -o jsonpath="{.status.loadBalancer.ingress[0].ip}"
```

Use this IP address with port 8545 to connect to the Ethereum network: `http://<EXTERNAL-IP>:8545`

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