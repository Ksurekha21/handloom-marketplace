import urllib.request, json, os
url = 'http://127.0.0.1:5000/api/buyer/products?material=Silk&saree_type=Venkatagiri'
with urllib.request.urlopen(url) as resp:
    data = json.load(resp)
out = os.path.join(os.path.dirname(__file__), 'api_result.json')
with open(out, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('wrote', out)
