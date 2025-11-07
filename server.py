#!/usr/bin/env python3
"""
Simple HTTP Server for Miami Junk Car Website
Run this file to serve the website locally on http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        # Handle directory requests by serving index.html
        if self.path.endswith('/'):
            self.path += 'index.html'
        
        # Handle requests without extensions by adding .html
        if '.' not in os.path.basename(self.path):
            self.path += '/index.html'
            
        return super().do_GET()

def main():
    # Change to the website directory
    website_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(website_dir)
    
    # Create server
    handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print("=" * 60)
            print("🚗 MIAMI JUNK CAR WEBSITE - LOCAL SERVER")
            print("=" * 60)
            print(f"✅ Server running at: http://localhost:{PORT}")
            print(f"📁 Serving files from: {website_dir}")
            print("\n🌐 AVAILABLE PAGES:")
            print("   • Homepage: http://localhost:8000/")
            print("   • Miami Location: http://localhost:8000/locations/miami/")
            print("   • Coral Gables: http://localhost:8000/locations/coral-gables/")
            print("   • Homestead: http://localhost:8000/locations/homestead/")
            print("   • Kendall: http://localhost:8000/locations/kendall/")
            print("   • Toyota Brand: http://localhost:8000/brands/toyota/")
            print("   • Nissan Brand: http://localhost:8000/brands/nissan/")
            print("   • Trucks: http://localhost:8000/vehicles/trucks/")
            print("   • SUVs: http://localhost:8000/vehicles/suvs/")
            print("   • Accident Service: http://localhost:8000/services/accident-damaged-cars/")
            print("   • Fire Damage: http://localhost:8000/services/fire-damaged-cars/")
            print("   • Inherited Cars: http://localhost:8000/services/inherited-vehicles/")
            print("\n" + "=" * 60)
            print("Press Ctrl+C to stop the server")
            print("=" * 60)
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("🌐 Opening website in your default browser...")
            except:
                print("💡 Manually open: http://localhost:8000 in your browser")
            
            print("\n⏳ Server is running... waiting for requests")
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()