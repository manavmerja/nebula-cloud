/**
 * Icon Map Utility
 * Automatically selects the correct AWS icon from the /public/aws-icons/ folder
 * based on the node's label.
 *
 * FEATURES:
 * 1. Extension Awareness: Uses .png or .svg based on your specific file list.
 * 2. Smart Matching: Detects generic terms like "Archive", "Active Files", "Cache".
 * 3. Edge Cases: Handles Public/Private Subnets, Gateways, and Endpoints.
 */

export const getCloudIconPath = (label: string): string => {
  const lowerLabel = label.toLowerCase();

  // --------------------------------------------------------
  // 1. NETWORKING (Subnets, Gateways, VPC)
  // --------------------------------------------------------

  // Specific Subnet Types (Must come before generic 'subnet')
  if (lowerLabel.includes('public') && lowerLabel.includes('subnet')) {
    return '/aws-icons/public-subnet.svg';
  }
  if (lowerLabel.includes('private') && lowerLabel.includes('subnet')) {
    return '/aws-icons/private-subnet.svg';
  }

  // Gateways & Routing
  if (lowerLabel.includes('internet gateway') || lowerLabel.includes('igw')) {
    return '/aws-icons/internet-gateway.png'; // ⚠️ PNG
  }
  if (lowerLabel.includes('nat gateway') || lowerLabel.includes('nat')) {
    return '/aws-icons/nat-gateway.svg';
  }
  if (lowerLabel.includes('route table') || lowerLabel.includes('route')) {
    return '/aws-icons/route-table.svg';
  }
  if (lowerLabel.includes('endpoint') || lowerLabel.includes('privatelink')) {
    return '/aws-icons/vpc-endpoint.svg';
  }
  if (lowerLabel.includes('nacl') || lowerLabel.includes('acl')) {
    return '/aws-icons/nacl.svg';
  }

  // Core Networking
  if (lowerLabel.includes('vpc')) {
    return '/aws-icons/vpc.svg';
  }
  if (lowerLabel.includes('api gateway') || lowerLabel.includes('api')) {
    return '/aws-icons/api-gateway.png'; // ⚠️ PNG
  }
  if (lowerLabel.includes('cloudfront') || lowerLabel.includes('cdn')) {
    return '/aws-icons/cloud-front.png'; // ⚠️ PNG
  }
  if (lowerLabel.includes('load balancer') || lowerLabel.includes('elb') || lowerLabel.includes('alb')) {
    return '/aws-icons/load-balancer.png'; // ⚠️ PNG
  }

  // --------------------------------------------------------
  // 2. COMPUTE (EC2, Lambda, Containers)
  // --------------------------------------------------------

  // Standard Compute
  if (lowerLabel.includes('ec2') || lowerLabel.includes('instance') || lowerLabel.includes('server') || lowerLabel.includes('vm')) {
    return '/aws-icons/ec2.svg';
  }
  if (lowerLabel.includes('lambda') || lowerLabel.includes('function')) {
    return '/aws-icons/lambda-function.svg';
  }

  // Containers
  if (lowerLabel.includes('ecs') || lowerLabel.includes('container')) {
    return '/aws-icons/ecs.svg';
  }
  if (lowerLabel.includes('eks') || lowerLabel.includes('kubernetes') || lowerLabel.includes('k8s')) {
    return '/aws-icons/eks.svg';
  }
  if (lowerLabel.includes('fargate')) {
    return '/aws-icons/fargate.png'; // ⚠️ PNG
  }

  // --------------------------------------------------------
  // 3. DATABASE & STORAGE (Includes Smart Logic)
  // --------------------------------------------------------

  // Caching (Redis/Memcached/Session)
  if (
    lowerLabel.includes('redis') ||
    lowerLabel.includes('memcached') ||
    lowerLabel.includes('elasticache') ||
    lowerLabel.includes('cache') ||      // Catch "Session Cache"
    lowerLabel.includes('session')
  ) {
    if (lowerLabel.includes('memcached')) return '/aws-icons/elasticache-memcached.png';
    return '/aws-icons/elasticache-redis.svg'; // Default to Redis
  }

  // S3 / File Storage (Catches "Active Files", "File Storage", "Assets")
  if (
    lowerLabel.includes('s3') ||
    lowerLabel.includes('bucket') ||
    lowerLabel.includes('object') ||
    lowerLabel.includes('file') ||       // Catch "File Storage"
    lowerLabel.includes('storage') ||    // Catch "Storage"
    lowerLabel.includes('asset')
  ) {
    return '/aws-icons/s3-bucket.svg';
  }

  // Glacier / Archive (Catches "Long-term Archive", "Backup")
  if (
    lowerLabel.includes('glacier') ||
    lowerLabel.includes('archive') ||    // Catch "Archive"
    lowerLabel.includes('backup') ||     // Catch "Backup"
    lowerLabel.includes('cold')
  ) {
    return '/aws-icons/glacier.png';     // ⚠️ PNG
  }

  // Databases (Specific)
  if (lowerLabel.includes('aurora')) return '/aws-icons/aurora.png'; // ⚠️ PNG
  if (lowerLabel.includes('dynamo') || lowerLabel.includes('nosql')) return '/aws-icons/dynamodb.png'; // ⚠️ PNG

  // Generic RDS (Catches "PostgreSQL", "MySQL", "Database")
  if (
    lowerLabel.includes('rds') ||
    lowerLabel.includes('sql') ||
    lowerLabel.includes('database') ||
    lowerLabel.includes('db')
  ) {
    return '/aws-icons/rds.png';         // ⚠️ PNG
  }

  // --------------------------------------------------------
  // 4. SECURITY & MANAGEMENT
  // --------------------------------------------------------
  if (lowerLabel.includes('iam') || lowerLabel.includes('role') || lowerLabel.includes('identity')) {
    return '/aws-icons/Iam-role.svg';    // Matches your snippet's capitalization
  }
  if (lowerLabel.includes('security group') || lowerLabel.includes('firewall')) {
    return '/aws-icons/security-group.svg';
  }
  if (lowerLabel.includes('waf') || lowerLabel.includes('shield')) {
    return '/aws-icons/waf.png';         // ⚠️ PNG
  }
  if (lowerLabel.includes('secrets') || lowerLabel.includes('key')) {
    return '/aws-icons/secrets-manager.png'; // ⚠️ PNG
  }
  if (lowerLabel.includes('cloudwatch') || lowerLabel.includes('monitor') || lowerLabel.includes('log')) {
    return '/aws-icons/cloud-watch.png'; // ⚠️ PNG
  }
  if (lowerLabel.includes('x-ray') || lowerLabel.includes('trace')) {
    return '/aws-icons/x-ray.png';       // ⚠️ PNG
  }

  // --------------------------------------------------------
  // 5. APPLICATION INTEGRATION & DEVOPS
  // --------------------------------------------------------
  if (lowerLabel.includes('sns') || lowerLabel.includes('topic') || lowerLabel.includes('notification')) {
    return '/aws-icons/sns.svg';
  }
  if (lowerLabel.includes('sqs') || lowerLabel.includes('queue') || lowerLabel.includes('message')) {
    return '/aws-icons/sqs.svg';
  }
  if (lowerLabel.includes('eventbridge') || lowerLabel.includes('bus') || lowerLabel.includes('event')) {
    return '/aws-icons/eventbridge.png'; // ⚠️ PNG
  }
  if (lowerLabel.includes('pipeline') || lowerLabel.includes('ci/cd')) {
    return '/aws-icons/code-pipeline.png'; // ⚠️ PNG
  }
  if (lowerLabel.includes('build')) {
    return '/aws-icons/code-build.png';  // ⚠️ PNG
  }

  // --------------------------------------------------------
  // FALLBACK (Default Icon)
  // --------------------------------------------------------
  return '/aws-icons/ec2.svg';
};