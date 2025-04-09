# VPC Configuration
vpc_name     = "nethermind-vpc"
subnet_name  = "nethermind-subnet"
subnet_cidr  = "10.0.0.0/20"
pod_cidr     = "10.16.0.0/16"
service_cidr = "10.32.0.0/16"

# GKE Configuration
cluster_name = "nethermind-cluster"
environment  = "dev"

# Node Pool
node_count     = 1
max_node_count = 3
machine_type   = "e2-standard-2"
disk_size_gb   = 30

# Artifact Registry
repository_name = "nethermind"
namespace       = "nethermind"

authorized_networks = [
  {
    cidr_block   = "0.0.0.0/0"
    display_name = "All IPs"
  }
]