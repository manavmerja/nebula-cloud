// src/utils/iconMap.ts

export const getCloudIconPath = (label: string): string => {
  const lowerLabel = label.toLowerCase();

  // --- COMPUTE ---
  if (lowerLabel.includes('lambda') || lowerLabel.includes('function')) {
    return '/aws-icons/lambda-function.svg'; // Check extension
  }
  if (lowerLabel.includes('ec2') || lowerLabel.includes('server') || lowerLabel.includes('instance')) {
    return '/aws-icons/ec2.svg';
  }
  if (lowerLabel.includes('ecs') || lowerLabel.includes('container')) {
    return '/aws-icons/ecs.svg';
  }
  if (lowerLabel.includes('eks') || lowerLabel.includes('kubernetes')) {
    return '/aws-icons/eks.svg';
  }
  if (lowerLabel.includes('fargate')) {
    return '/aws-icons/fargate.png';
  }

  // --- STORAGE & DATABASE ---
  if (lowerLabel.includes('s3') || lowerLabel.includes('bucket') || lowerLabel.includes('object')) {
    return '/aws-icons/s3-bucket.svg'; // Matches your filename 's3-bucket'
  }
  if (lowerLabel.includes('rds') || lowerLabel.includes('sql') || lowerLabel.includes('mysql') || lowerLabel.includes('postgres')) {
    return '/aws-icons/rds.png';
  }
  if (lowerLabel.includes('dynamo') || lowerLabel.includes('nosql')) {
    return '/aws-icons/dynamodb.png';
  }
  if (lowerLabel.includes('aurora')) {
    return '/aws-icons/aurora.png';
  }

  // --- NETWORKING ---
  if (lowerLabel.includes('vpc') || lowerLabel.includes('network')) {
    return '/aws-icons/vpc.svg';
  }
  if (lowerLabel.includes('gateway') || lowerLabel.includes('api')) {
    return '/aws-icons/api-gateway.png'; // Matches your filename 'api-gateway'
  }
  if (lowerLabel.includes('load balancer') || lowerLabel.includes('elb') || lowerLabel.includes('alb')) {
    return '/aws-icons/load-balancer.png';
  }
  if (lowerLabel.includes('cloudfront') || lowerLabel.includes('cdn')) {
    return '/aws-icons/cloud-front.png';
  }

  // --- SECURITY & MANAGEMENT ---
  if (lowerLabel.includes('iam') || lowerLabel.includes('role') || lowerLabel.includes('policy')) {
    return '/aws-icons/Iam-role.svg'; // Matches 'lam-role' from your screenshot
  }
  if (lowerLabel.includes('security group') || lowerLabel.includes('firewall')) {
    return '/aws-icons/security-group.svg';
  }
  if (lowerLabel.includes('waf') || lowerLabel.includes('shield')) {
    return '/aws-icons/waf.png';
  }
  if (lowerLabel.includes('secrets')) {
    return '/aws-icons/secrets-manager.png';
  }
  if (lowerLabel.includes('cloudwatch') || lowerLabel.includes('monitor')) {
    return '/aws-icons/cloud-watch.png';
  }

  // --- QUEUES & NOTIFICATIONS ---
  if (lowerLabel.includes('sns') || lowerLabel.includes('topic')) {
    return '/aws-icons/sns.svg';
  }
  if (lowerLabel.includes('sqs') || lowerLabel.includes('queue')) {
    return '/aws-icons/sqs.svg';
  }

  // --- DEVOPS ---
  if (lowerLabel.includes('pipeline')) return '/aws-icons/code-pipeline.png';
  if (lowerLabel.includes('build')) return '/aws-icons/code-build.png';

  // --- DEFAULT FALLBACK ---
  // If we don't know what it is, show a generic EC2 icon or a specific 'cloud' icon if you have one
  return '/aws-icons/ec2.svg';
};