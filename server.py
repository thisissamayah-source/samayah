import http.server
import socketserver
import os
import sys

PORT = 8000
DIRECTORY = r"C:\Users\SAMAYAH\.gemini\antigravity\scratch\sathyaraj-portfolio"

class DualStackServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

class TCPServer6(socketserver.TCPServer):
    address_family = socketserver.socket.AF_INET6

    def server_bind(self):
        # Allow instant address reuse
        self.socket.setsockopt(socketserver.socket.SOL_SOCKET, socketserver.socket.SO_REUSEADDR, 1)
        # Enable dual-stack (IPv4 mapped inside IPv6) so both localhost/127.0.0.1 and ::1 work
        try:
            self.socket.setsockopt(socketserver.socket.IPPROTO_IPV6, socketserver.socket.IPV6_V6ONLY, 0)
        except Exception as e:
            print("Warning: could not set dual-stack IPv6/IPv4 options:", e, file=sys.stderr)
        super().server_bind()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    
    # Force output flushing for real-time logging
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)
    
    print(f"Dual-stack HTTP server initialization on port {PORT}...", flush=True)
    try:
        with TCPServer6(("", PORT), DualStackServer) as httpd:
            print(f"Listening on http://localhost:{PORT}/ (IPv4 & IPv6)", flush=True)
            httpd.serve_forever()
    except Exception as e:
        print(f"Server Error: {e}", file=sys.stderr, flush=True)
        sys.exit(1)
