
PRICING_TABLE = {
    "instance": 18.00,      
    "server": 18.00,
    "ec2": 18.00,
    "bucket": 2.50,        
    "storage": 2.50,
    "s3": 2.50,
    "database": 35.00,      
    "rds": 35.00,
    "db": 35.00,
    "cluster": 40.00,
    "lambda": 0.00,         
    "function": 0.00,
    "load balancer": 20.00, 
    "vpc": 0.00,            
    "subnet": 0.00,         
    "gateway": 0.00,        
    "cloudfront": 5.00,     
}

def calculate_cost(nodes_list):
    """
    Nodes analyze karke estimated monthly cost calculate karega.
    """
    total_cost = 0.0
    breakdown = {}

    for node in nodes_list:
        # Label ko lowercase karte hain taaki matching easy ho
        label = node.get("data", {}).get("label", "").lower()
        if not label:
            label = node.get("label", "").lower()

        item_cost = 0.0
        matched_key = "other"

        for key, price in PRICING_TABLE.items():
            if key in label:
                item_cost = price
                matched_key = key
                break 
        
    
        total_cost += item_cost

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