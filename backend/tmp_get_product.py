import requests, json
r = requests.get('http://127.0.0.1:5000/api/buyer/product/2')
print('status', r.status_code)
try:
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print('json error', e)
