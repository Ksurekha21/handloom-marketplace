import urllib.request, json
url = 'http://127.0.0.1:5000/api/buyer/search?q=Venkatagiri'
with urllib.request.urlopen(url) as resp:
    data = json.load(resp)
out='c:/handloom-connect/backend/search_out.json'
with open(out,'w',encoding='utf-8') as f:
    json.dump(data,f,ensure_ascii=False,indent=2)
print('wrote', out)
