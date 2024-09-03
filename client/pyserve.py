import os
import hashlib
import http.server
import socketserver
import time
import threading
import asyncio
import websockets

PORT = 9001
WS_PORT = 9002
REALTIME_UPDATE = True

class HttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.manifest': 'text/cache-manifest',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg':	'image/svg+xml',
        '.css':	'text/css',
        '.js':'application/x-javascript',
        '.wasm': 'application/wasm',
        '.json': 'application/json',
        '.xml': 'application/xml',
    }

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


class MyTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def hash_directory(directory):
    hash_obj = hashlib.md5()
    for root, dirs, files in os.walk(directory):
        for file in sorted(files):  # Sort to ensure consistent order
            if file.endswith('.html') or file.endswith('.js') or file.endswith('.css'):
                file_path = os.path.join(root, file)
                # Use file metadata (name, size, and modification time) for hashing
                stat = os.stat(file_path)
                hash_obj.update(file.encode())
                hash_obj.update(str(stat.st_size).encode())
                hash_obj.update(str(stat.st_mtime).encode())
    return hash_obj.hexdigest()

current_hash = None
ws_connections = set()

def run_http_server():
    with MyTCPServer(("", PORT), HttpRequestHandler) as httpd:
        print(f"Serving HTTP at http://localhost:{PORT}")
        httpd.serve_forever()

async def run_ws_server(websocket, path):
    ws_connections.add(websocket)
    try:
        async for message in websocket:
            pass  # Keep the connection open
    finally:
        ws_connections.remove(websocket)

async def watch_files():
    global current_hash
    current_hash = hash_directory('.')
    async with websockets.serve(run_ws_server, "localhost", WS_PORT):
        while True:
            await asyncio.sleep(1)
            new_hash = hash_directory('.')
            if new_hash != current_hash:
                print("Change detected, notifying clients...")
                current_hash = new_hash
                await notify_clients()

async def notify_clients():
    if ws_connections:
        await asyncio.wait([asyncio.create_task(ws.send("reload")) for ws in ws_connections])

def WebSocketServer():
    http_thread = threading.Thread(target=run_http_server)
    http_thread.daemon = True
    http_thread.start()

    asyncio.run(watch_files())

def StandaloneHTTPServer():
    httpd = http.server.HTTPServer(('', PORT), HttpRequestHandler)
    print(f"Serving HTTP at http://localhost:{PORT}")
    httpd.serve_forever()

def main():
    if REALTIME_UPDATE:
        WebSocketServer()
    else:
        StandaloneHTTPServer()

if __name__ == "__main__":
    main()