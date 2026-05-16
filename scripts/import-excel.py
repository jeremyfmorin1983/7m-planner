#!/usr/bin/env python3
"""
Import 7M_Financial_Planning_Updated.xlsx into Supabase.

Usage:
  pip install openpyxl requests
  SUPABASE_URL=https://xxx.supabase.co SUPABASE_KEY=your_service_role_key python3 scripts/import-excel.py
"""

import os, sys, json, datetime
import openpyxl
import urllib.request

XLSX = os.path.join(os.path.dirname(__file__), '..', '..', '7M_Financial_Planning_Updated.xlsx')
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

def supabase_upsert(table, rows):
    if not rows:
        return
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    data = json.dumps(rows).encode()
    req = urllib.request.Request(
        url, data=data, method='POST',
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
        }
    )
    with urllib.request.urlopen(req) as resp:
        status = resp.status
    print(f"  → {table}: {len(rows)} rows ({status})")

def safe_num(v):
    if v is None: return None
    try: return float(v)
    except: return None

def safe_date(v):
    if v is None: return None
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime('%Y-%m-%d')
    return None

def sheet_rows(ws):
    rows = list(ws.iter_rows(values_only=True))
    if not rows: return [], []
    headers = [str(h).strip() if h else '' for h in rows[0]]
    return headers, rows[1:]

wb = openpyxl.load_workbook(XLSX, data_only=True)

# ── Labor ──────────────────────────────────────────────────────────────────────
print("Importing Labor…")
ws = wb['Labor']
headers, data_rows = sheet_rows(ws)
labor_rows = []
for row in data_rows:
    if not any(row): continue
    r = dict(zip(headers, row))
    labor_rows.append({
        'budget_dept':    str(r.get('Budget Dept') or '').strip() or None,
        'functional_dept': str(r.get('Functional Dept') or '').strip() or None,
        'name':           str(r.get('Name') or '').strip() or None,
        'role':           str(r.get('Role') or '').strip() or None,
        'start_date':     safe_date(r.get('Start Date')),
        'total_comp':     safe_num(r.get('TOTAL COMP')),
        'base':           safe_num(r.get('Base')),
        'match_403b':     safe_num(r.get('403B Match')),
        'cell_phone':     safe_num(r.get('Cell Phone')),
        'insurance_fica': safe_num(r.get('Insurance & FICA')),
        'housing':        safe_num(r.get('Housing')),
        **{m: safe_num(r.get(m.capitalize())) or 0 for m in MONTHS},
    })

# ── Contracts ──────────────────────────────────────────────────────────────────
print("Importing Contracts…")
ws = wb['Contracts']
headers, data_rows = sheet_rows(ws)
contract_rows = []
for row in data_rows:
    if not any(row): continue
    r = dict(zip(headers, row))
    contract_rows.append({
        'department':       str(r.get('Department') or '').strip() or None,
        'phase':            str(r.get('Phase') or '').strip() or None,
        'category':         str(r.get('Category') or '').strip() or None,
        'type':             str(r.get('Type') or '').strip() or None,
        'description':      str(r.get('Description') or '').strip() or None,
        'vendor':           str(r.get('Vendor') or '').strip() or None,
        'start_date':       safe_date(r.get('Start Date')),
        'end_date':         safe_date(r.get('End Date')),
        'months':           safe_num(r.get('Months')),
        'contract_amount':  safe_num(r.get('Contract Amount')),
        **{m: safe_num(r.get(m.capitalize())) or 0 for m in MONTHS},
    })

# ── Assets ─────────────────────────────────────────────────────────────────────
print("Importing Assets…")
ws = wb['Assets']
headers, data_rows = sheet_rows(ws)
asset_rows = []
for row in data_rows:
    if not any(row): continue
    r = dict(zip(headers, row))
    asset_rows.append({
        'department':     str(r.get('Department') or '').strip() or None,
        'phase':          str(r.get('Phase') or '').strip() or None,
        'category':       str(r.get('Category') or '').strip() or None,
        'asset_type':     str(r.get('Asset Type') or '').strip() or None,
        'brand':          str(r.get('Brand') or '').strip() or None,
        'model':          str(r.get('Model') or '').strip() or None,
        'serial_number':  str(r.get('Serial #') or '').strip() or None,
        'comments':       str(r.get('Comments') or '').strip() or None,
        'location_user':  str(r.get('Location / User') or '').strip() or None,
        'purchase_date':  safe_date(r.get('Purchase Date')),
        'life_in_months': safe_num(r.get('LIM')),
        'refresh_date':   safe_date(r.get('Refresh Date')),
        'unit_cost':      safe_num(r.get('Unit Cost')),
        'purchase_amount': safe_num(r.get('Purchase Amount')),
        'quantity':       safe_num(r.get('Quantity')) or 1,
        **{m: safe_num(r.get(m.capitalize())) or 0 for m in MONTHS},
    })

# ── Other ──────────────────────────────────────────────────────────────────────
print("Importing Other…")
ws = wb['Other']
headers, data_rows = sheet_rows(ws)
other_rows = []
for row in data_rows:
    if not any(row): continue
    r = dict(zip(headers, row))
    other_rows.append({
        'department': str(r.get('Department') or '').strip() or None,
        'phase':      str(r.get('Phase') or '').strip() or None,
        'category':   str(r.get('Category') or '').strip() or None,
        'item':       str(r.get('Item') or '').strip() or None,
        **{m: safe_num(r.get(m.capitalize())) or 0 for m in MONTHS},
    })

if not SUPABASE_URL or not SUPABASE_KEY:
    print("\nNo SUPABASE_URL/SUPABASE_KEY set — dry run only.")
    print(f"  Labor:     {len(labor_rows)} rows")
    print(f"  Contracts: {len(contract_rows)} rows")
    print(f"  Assets:    {len(asset_rows)} rows")
    print(f"  Other:     {len(other_rows)} rows")
    sys.exit(0)

supabase_upsert('labor', labor_rows)
supabase_upsert('contracts', contract_rows)
supabase_upsert('assets', asset_rows)
supabase_upsert('other_items', other_rows)
print("\nDone.")
