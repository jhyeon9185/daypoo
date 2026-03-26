resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled    = true
  default_root_object = "index.html"

  # S3 Origin (프론트엔드)
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-Frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # EC2 Origin (백엔드 API)
  origin {
    domain_name = aws_instance.app.public_dns
    origin_id   = "EC2-Backend"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # /api/* 경로는 백엔드(EC2)로 전달
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "EC2-Backend"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    forwarded_values {
      query_string = true
      cookies { forward = "all" }
      headers = ["Origin", "Authorization"] # API 필수 헤더 전달
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # 나머지 모든 요청은 프론트엔드(S3) 정적 파일 제공
  default_cache_behavior {
    target_origin_id = "S3-Frontend"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-cf"
  }
}
