import urllib.request, json
url = 'http://127.0.0.1:5000/api/buyer/products?material=Silk&saree_type=Venkatagiri'
with urllib.request.urlopen(url) as resp:
    data = json.load(resp)
print(json.dumps(data, indent=2, ensure_ascii=False))
