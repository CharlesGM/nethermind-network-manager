output "grafana_password" {
  description = "The randomly generated password for Grafana admin user"
  value       = random_password.grafana_password.result
  sensitive   = true
}

output "namespace" {
  description = "The namespace where kube-prometheus stack is deployed"
  value       = var.namespace
}

output "prometheus_service_name" {
  description = "The name of the Prometheus service"
  value       = "prometheus-operated"
}

output "grafana_service_name" {
  description = "The name of the Grafana service"
  value       = "kube-prometheus-stack-grafana"
}

output "alertmanager_service_name" {
  description = "The name of the Alertmanager service"
  value       = "kube-prometheus-stack-alertmanager"
}

output "cluster_endpoint" {
  description = "The endpoint of the GKE cluster"
  value       = var.cluster_endpoint
} 