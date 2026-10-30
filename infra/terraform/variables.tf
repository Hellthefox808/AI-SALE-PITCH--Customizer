variable "aws_region" {
  description = "Target AWS Region for PitchCraft AI infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name (production, staging, dev)"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application identifier"
  type        = string
  default     = "pitchcraft-ai"
}

variable "container_image" {
  description = "Docker image repository URL and tag"
  type        = string
  default     = "pitchcraft-ai:latest"
}

variable "container_port" {
  description = "Port exposed by the PitchCraft AI container"
  type        = number
  default     = 4000
}

variable "cpu" {
  description = "Fargate CPU units (256 = 0.25 vCPU, 512 = 0.5 vCPU, 1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Fargate memory allocation in MiB"
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Desired number of container task replicas"
  type        = number
  default     = 2
}

