import json, urllib.request, sys
URL="http://localhost:18791/mcp"
def post(body, sid=None):
    h={"content-type":"application/json","accept":"application/json, text/event-stream"}
    if sid: h["mcp-session-id"]=sid
    resp=urllib.request.urlopen(urllib.request.Request(URL, json.dumps(body).encode(), h), timeout=30)
    return resp.headers.get("mcp-session-id"), resp.read().decode()
def parse(t):
    for l in t.splitlines():
        if l.startswith("data:"): return json.loads(l[5:])
    return json.loads(t)
sid,t=post({"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}})
ins=parse(t)["result"]["instructions"]
try: post({"jsonrpc":"2.0","method":"notifications/initialized"},sid)
except Exception as e: pass
_,t2=post({"jsonrpc":"2.0","id":2,"method":"tools/list"},sid); tl=parse(t2)["result"]["tools"]
json.dump({"instructions":ins,"tools":tl}, open("raven/truth.json","w"))
print("instructions", len(ins))
for x in tl: print(x["name"], len(x["description"]), "schema json", len(json.dumps(x["inputSchema"])))
print(repr(ins[-100:]))
for x in tl: print(x['name'], repr(x['description'][-100:]))
