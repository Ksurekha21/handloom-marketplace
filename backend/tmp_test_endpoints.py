import requests
r = requests.get('http://127.0.0.1:5000/api/buyer/search', params={'q':'Venkatagiri','per_page':3})
print('search', r.status_code)
try:
    print(r.json().get('total'))
except Exception as e:
    print('search json error', e)
s = requests.get('http://127.0.0.1:5000/api/buyer/suggestions', params={'q':'Venkatagiri','limit':6})
print('sugg', s.status_code)
print(s.json())
