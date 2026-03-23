import requests

BASE_URL = "http://localhost:5000/api/weaver/order-material"

def test_order():
    # Assuming weaver_id=1 and material_id=2 (Pure Pattu)
    payload = {
        "weaver_id": 1,
        "material_id": 2,
        "quantity": "500 g",
        "total_price": 700.0,
        "payment_method": "COD",
        "address": "12 377, srikalahasti",
        "phone": "4588930021"
    }
    print(f"Testing order placement for {payload['material_id']}...")
    try:
        r = requests.post(BASE_URL, json=payload)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_order()
