output "alb_dns_name" {
  description = "Publicly accessible DNS hostname of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "service_name" {
  description = "Name of the ECS Service"
  value       = aws_ecs_service.main.name
}

output "health_check_url" {
  description = "Healthcheck URL for automated uptime monitors"
  value       = "http://${aws_lb.main.dns_name}/api/health"
}
