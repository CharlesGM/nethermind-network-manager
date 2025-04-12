resource "random_password" "grafana_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = var.namespace
    labels = {
      name = var.namespace
    }
  }
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = var.chart_version
  namespace  = var.namespace
  create_namespace = false  # We're creating the namespace separately
  atomic     = true        # Rollback on failure
  wait       = true        # Wait for resources to be ready
  timeout    = 1200        # Increase timeout to 20 minutes

  # Wait for the cluster to be ready and the namespace to be created
  depends_on = [var.cluster_endpoint, kubernetes_namespace.monitoring]

  values = [
    templatefile("${path.module}/values.yaml", {
      grafana_admin_password = random_password.grafana_password.result
      alertmanager_enabled   = var.alertmanager_enabled
      prometheus_storage_class = var.prometheus_storage_class
      prometheus_storage_size = var.prometheus_storage_size
      namespace              = var.namespace
    })
  ]

  set {
    name  = "prometheus.prometheusSpec.retention"
    value = var.prometheus_retention
  }

  set {
    name  = "prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName"
    value = var.prometheus_storage_class
  }

  set {
    name  = "prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage"
    value = var.prometheus_storage_size
  }

  # Add resource limits to prevent OOM issues
  set {
    name  = "prometheus.prometheusSpec.resources.limits.memory"
    value = "1Gi"
  }

  set {
    name  = "prometheus.prometheusSpec.resources.limits.cpu"
    value = "500m"
  }

  set {
    name  = "grafana.resources.limits.memory"
    value = "512Mi"
  }

  set {
    name  = "grafana.resources.limits.cpu"
    value = "250m"
  }

  dynamic "set" {
    for_each = var.additional_values
    content {
      name  = set.key
      value = set.value
    }
  }
} 