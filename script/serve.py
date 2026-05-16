#!/usr/bin/env python3
import argparse
import http.server
import os
import socket
import ssl
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CERT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.cert')
CERT_FILE = os.path.join(CERT_DIR, 'cert.pem')
KEY_FILE = os.path.join(CERT_DIR, 'key.pem')


def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'


def generate_cert(ip):
    os.makedirs(CERT_DIR, exist_ok=True)
    subprocess.run([
        'openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
        '-keyout', KEY_FILE,
        '-out', CERT_FILE,
        '-days', '1',
        '-subj', '/CN=off-point',
        '-addext', f'subjectAltName=IP:{ip},IP:127.0.0.1',
    ], check=True, capture_output=True)


def main():
    parser = argparse.ArgumentParser(description='Serve off-point for development')
    parser.add_argument('--ssl', action='store_true', help='Enable HTTPS with auto-generated self-signed cert')
    parser.add_argument('port', nargs='?', type=int, default=8080, help='Port to listen on (default: 8080)')
    args = parser.parse_args()

    ip = get_lan_ip()
    os.chdir(ROOT)

    server = http.server.HTTPServer(('0.0.0.0', args.port), http.server.SimpleHTTPRequestHandler)

    if args.ssl:
        print(f'Generating self-signed certificate for {ip}...')
        generate_cert(ip)
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ctx.load_cert_chain(CERT_FILE, KEY_FILE)
        server.socket = ctx.wrap_socket(server.socket, server_side=True)
        scheme = 'https'
    else:
        scheme = 'http'

    network_url = f'{scheme}://{ip}:{args.port}'

    print(f'\nServing {ROOT}:')
    print(f'  Local:   {scheme}://localhost:{args.port}')
    print(f'  Network: {network_url}')
    if args.ssl:
        print(f'\nAccept the self-signed certificate warning on your phone.')

    # Print QR code for the network URL
    try:
        subprocess.run(['qrencode', '-t', 'ANSIUTF8', network_url], check=True)
    except FileNotFoundError:
        pass

    print(f'Press Ctrl+C to stop.\n')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')


if __name__ == '__main__':
    main()
