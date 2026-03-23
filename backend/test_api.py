import requests

res = requests.get("http://127.0.0.1:5000/api/buyer/orders/3")
print(f"STATUS: {res.status_code}")
print(f"JSON: {res.json()}")
