import urllib.request, json
url = 'http://127.0.0.1:5000/api/buyer/product/3'
with urllib.request.urlopen(url) as resp:
    data = json.load(resp)
with open('c:/handloom-connect/backend/product_out.json','w',encoding='utf-8') as f:
    json.dump(data,f,ensure_ascii=False,indent=2)
print('wrote product_out.json')
