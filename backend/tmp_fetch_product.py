import urllib.request, json
url = 'http://127.0.0.1:5000/api/buyer/product/3'
with urllib.request.urlopen(url) as r:
    data = json.load(r)
prod = data.get('product')
print('title:', prod.get('title'))
print('images:')
for i,u in enumerate(prod.get('images',[])):
    print(i, (u[:200]+'...') if len(u)>200 else u)
print('image_url:', prod.get('image_url'))
