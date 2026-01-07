# app/services/pricing.py

# Standard Monthly Costs (Estimated in USD)
PRICING_TABLE = {
    "instance": 18.00,      # EC2 / VM (t2.micro approx + storage)
    "server": 18.00,
    "ec2": 18.00,
    "bucket": 2.50,         # S3 / Storage
    "storage": 2.50,
    "s3": 2.50,
    "database": 35.00,      # RDS / SQL (db.t3.micro)
    "rds": 35.00,
    "db": 35.00,
    "cluster": 40.00,
    "lambda": 0.00,         # Lambda (Free tier usually covers simple usage)
    "function": 0.00,
    "load balancer": 20.00, # ALB/ELB
    "vpc": 0.00,            # Free
    "subnet": 0.00,         # Free
    "gateway": 0.00,        # Free
    "cloudfront": 5.00,     # CDN estimated traffic
}

def calculate_cost(nodes_list):
    """
    Nodes analyze karke estimated monthly cost calculate karega.
    """
    total_cost = 0.0
    breakdown = {}

    for node in nodes_list:
        # Label ko lowercase karte hain taaki matching easy ho
        # Agar label nahi hai to 'unknown' maan lo
        label = node.get("data", {}).get("label", "").lower()
        if not label:
            # Kabhi kabhi structure alag ho sakta hai, direct label check karo
            label = node.get("label", "").lower()

        item_cost = 0.0
        matched_key = "other"

        # Check karo kaunsa keyword match ho raha hai
        for key, price in PRICING_TABLE.items():
            if key in label:
                item_cost = price
                matched_key = key
                break # Pehla match milte hi ruk jao
        
        # Total me add karo
        total_cost += item_cost

        # Breakdown (Optional debugging ke liye)
        if item_cost > 0:
            if label in breakdown:
                breakdown[label] += item_cost
            else:
                breakdown[label] = item_cost

    return {
        "total": round(total_cost, 2),
        "currency": "USD",
        "breakdown": breakdown
    }