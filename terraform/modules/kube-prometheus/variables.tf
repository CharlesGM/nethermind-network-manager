variable "namespace" {
  description = "Namespace to deploy kube-prometheus stack"
  type        = string
  default     = "monitoring"
}

variable "chart_version" {
  description = "Version of the kube-prometheus-stack chart"
  type        = string
  default     = "55.0.0"
}

variable "prometheus_storage_class" {
  description = "Storage class for Prometheus persistent volume"
  type        = string
  default     = "standard"
}

variable "prometheus_storage_size" {
  description = "Storage size for Prometheus persistent volume"
  type        = string
  default     = "50Gi"
}

variable "prometheus_retention" {
  description = "How long to retain Prometheus data"
  type        = string
  default     = "15d"
}

variable "alertmanager_enabled" {
  description = "Whether to enable Alertmanager"
  type        = bool
  default     = true
}

variable "cluster_endpoint" {
  description = "Kubernetes cluster endpoint"
  type        = string
}

variable "additional_values" {
  description = "Additional values to pass to the Helm chart"
  type        = map(string)
  default     = {}
} 