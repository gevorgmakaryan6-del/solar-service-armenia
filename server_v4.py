import os
import json
import sqlite3
import urllib.request
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
from datetime import datetime

PORT = int(os.environ.get('PORT', 8080))
ROOT = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(ROOT, 'solar_service.db')

TELEGRAM_BOT_TOKEN = "8033146195:AAExqAeG1LedU9fZmsh8L7ZdGHlkgDvbSHo"
TELEGRAM_CHAT_ID = "923029460"

def send_telegram_alert(text):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': text,
        'parse_mode': 'HTML'
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception as e:
        print(f"Telegram alert error: {e}")

def db_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    c = db_conn()
    c.execute('''CREATE TABLE IF NOT EXISTS plant_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        power_kw REAL,
        inverter TEXT,
        panel_count INTEGER,
        year INTEGER,
        problem TEXT,
        phone TEXT,
        created_at TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS service_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id INTEGER,
        problem_type TEXT,
        description TEXT,
        status TEXT DEFAULT 'NEW',
        created_at TEXT,
        customer_name TEXT,
        phone TEXT,
        address TEXT,
        notes TEXT
    )''')
    existing_cols = [row['name'] for row in c.execute("PRAGMA table_info(service_requests)").fetchall()]
    new_cols = {
        'customer_name': 'TEXT',
        'phone': 'TEXT',
        'address': 'TEXT',
        'notes': 'TEXT'
    }
    for col, col_type in new_cols.items():
        if col not in existing_cols:
            c.execute(f"ALTER TABLE service_requests ADD COLUMN {col} {col_type}")
    c.commit()
    c.close()

def send_json(handler, data, status=200):
    body = json.dumps(data, ensure_ascii=False).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)

class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        parsed = urlparse(path).path
        if parsed == '/admin':
            return os.path.join(ROOT, 'admin.html')
        return super().translate_path(path)

    def do_GET(self):
        path = urlparse(self.path).path

        if path == '/api/health':
            return send_json(self, {'ok': True, 'status': 'up'})

        if path == '/api/admin/requests':
            c = db_conn()
            rows = c.execute('SELECT * FROM service_requests ORDER BY id DESC').fetchall()
            c.close()
            requests = [dict(r) for r in rows]
            return send_json(self, {'ok': True, 'requests': requests})

        if path == '/api/admin/plant-checks':
            c = db_conn()
            rows = c.execute('SELECT * FROM plant_checks ORDER BY id DESC').fetchall()
            c.close()
            checks = [dict(r) for r in rows]
            return send_json(self, {'ok': True, 'checks': checks})

        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            length = int(self.headers.get('Content-Length', 0))
            data = json.loads(self.rfile.read(length) or '{}')
        except Exception:
            return send_json(self, {'ok': False, 'error': 'Invalid JSON'}, 400)

        c = db_conn()
        now = datetime.now().isoformat(timespec='seconds')

        # Հաճախորդի պորտալի ստուգում հեռախոսով
        if path == '/api/client/portal':
            phone = data.get('phone', '').strip().replace(' ', '').replace('-', '')
            if not phone:
                c.close()
                return send_json(self, {'ok': False, 'error': 'Phone required'}, 400)

            # Որոնում ենք service_requests և plant_checks աղյուսակներում
            reqs = c.execute('SELECT * FROM service_requests WHERE phone LIKE ? ORDER BY id DESC', (f'%{phone[-8:]}%',)).fetchall()
            checks = c.execute('SELECT * FROM plant_checks WHERE phone LIKE ? ORDER BY id DESC', (f'%{phone[-8:]}%',)).fetchall()
            c.close()

            user_requests = [dict(r) for r in reqs]
            user_checks = [dict(c) for c in checks]

            return send_json(self, {
                'ok': True,
                'found': len(user_requests) > 0 or len(user_checks) > 0,
                'requests': user_requests,
                'checks': user_checks
            })

        if path == '/api/plant-check':
            required = ['power_kw', 'inverter', 'phone']
            if any(not data.get(k) for k in required):
                c.close()
                return send_json(self, {'ok': False, 'error': 'Missing required fields'}, 400)
            cur = c.execute('''INSERT INTO plant_checks
                (power_kw, inverter, panel_count, year, problem, phone, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)''',
                (data.get('power_kw'), data.get('inverter'), data.get('panel_count'), data.get('year'), data.get('problem'), data.get('phone'), now))
            c.commit()
            cid = cur.lastrowid
            c.close()

            tg_text = (
                f"☀️ <b>Նոր Plant Check Հայտ (#{cid})</b>\n\n"
                f"⚡ <b>Հզորություն:</b> {data.get('power_kw')} կՎտ\n"
                f"🔌 <b>Ինվերտոր:</b> {data.get('inverter')}\n"
                f"🔋 <b>Պանելներ:</b> {data.get('panel_count') or '-'}\n"
                f"📅 <b>Տարի:</b> {data.get('year') or '-'}\n"
                f"⚠️ <b>Խնդիր:</b> {data.get('problem') or '-'}\n"
                f"📞 <b>Հեռախոս:</b> <code>{data.get('phone')}</code>"
            )
            send_telegram_alert(tg_text)

            return send_json(self, {'ok': True, 'id': cid, 'message': 'Plant Check-ը ընդունված է'})

        if path == '/api/service-request':
            if not data.get('problem_type') and not data.get('phone'):
                c.close()
                return send_json(self, {'ok': False, 'error': 'problem_type or phone required'}, 400)
            cur = c.execute('''INSERT INTO service_requests
                (plant_id, problem_type, description, status, created_at, customer_name, phone, address, notes)
                VALUES (?, ?, ?, 'NEW', ?, ?, ?, ?, ?)''',
                (data.get('plant_id'), data.get('problem_type'), data.get('description'), now,
                 data.get('customer_name'), data.get('phone'), data.get('address'), data.get('notes')))
            c.commit()
            rid = cur.lastrowid
            c.close()

            tg_text = (
                f"🛠 <b>Նոր Service Request Հայտ (#{rid})</b>\n\n"
                f"👤 <b>Հաճախորդ:</b> {data.get('customer_name') or 'Անանուն'}\n"
                f"📞 <b>Հեռախոս:</b> <code>{data.get('phone') or '-'}</code>\n"
                f"📍 <b>Հասցե:</b> {data.get('address') or '-'}\n"
                f"⚠️ <b>Խնդիր / Փաթեթ:</b> {data.get('problem_type') or '-'}\n"
                f"📝 <b>Նկարագրություն:</b> {data.get('description') or '-'}"
            )
            send_telegram_alert(tg_text)

            return send_json(self, {'ok': True, 'id': rid})

        if path == '/api/admin/convert-check':
            check_id = data.get('check_id')
            if not check_id:
                c.close()
                return send_json(self, {'ok': False, 'error': 'check_id required'}, 400)
            
            row = c.execute('SELECT * FROM plant_checks WHERE id = ?', (check_id,)).fetchone()
            if not row:
                c.close()
                return send_json(self, {'ok': False, 'error': 'Plant check not found'}, 404)
            
            desc = f"Կայան: {row['power_kw']} կՎտ, Ինվերտոր: {row['inverter']}, Պանելներ: {row['panel_count']}, Տարեթիվ: {row['year']}"
            cur = c.execute('''INSERT INTO service_requests
                (plant_id, problem_type, description, status, created_at, customer_name, phone, address, notes)
                VALUES (?, ?, ?, 'NEW', ?, ?, ?, ?, ?)''',
                (row['id'], row['problem'], desc, now, 'Plant Check Client', row['phone'], '', 'Տեղափոխված է Plant Check-ից'))
            c.commit()
            new_req_id = cur.lastrowid
            c.close()
            return send_json(self, {'ok': True, 'new_request_id': new_req_id})

        if path == '/api/admin/request-status':
            req_id = data.get('id')
            new_status = data.get('status')
            notes = data.get('notes')
            address = data.get('address')
            if not req_id or not new_status:
                c.close()
                return send_json(self, {'ok': False, 'error': 'id and status required'}, 400)
            c.execute('UPDATE service_requests SET status = ?, notes = ?, address = COALESCE(?, address) WHERE id = ?', (new_status, notes, address, req_id))
            c.commit()
            c.close()
            return send_json(self, {'ok': True, 'message': 'Updated successfully'})

        c.close()
        return send_json(self, {'ok': False, 'error': 'Not found'}, 404)

if __name__ == '__main__':
    init_db()
    os.chdir(ROOT)
    print(f'Solar Service Armenia server: http://localhost:{PORT}')
    print(f'Admin Panel: http://localhost:{PORT}/admin')
    ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()