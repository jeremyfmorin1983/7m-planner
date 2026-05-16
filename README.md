# 7M Financial Planner

Church budget planning app for department leads. Built with Next.js, Supabase, and Vercel.

## Setup (one-time)

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → New project
2. In the SQL editor, paste and run `supabase-schema.sql` from this folder
3. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Configure environment variables
Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Import your Excel data
```bash
pip3 install openpyxl
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_KEY=your-service-role-key \
python3 scripts/import-excel.py
```
Use the **service role key** (not anon) for the import — found in Settings → API → service_role.

### 4. Create user accounts
In Supabase → Authentication → Users, invite each department lead by email.
Then in the `profiles` table, set their `department` and `is_admin` fields.

### 5. Run locally
```bash
npm run dev
```
Open http://localhost:3000

## Deploy to Netlify
1. Push this folder to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Build command: `npm run build` — Netlify will detect this automatically
4. Add the two env vars in Site settings → Environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy — done

## Pages
| Page | Description |
|------|-------------|
| Dashboard | Budget summary and monthly chart |
| Labor | Staff roster with monthly payroll |
| Contracts | Vendor contracts by department |
| Assets | Equipment inventory with refresh alerts |
| Other | Miscellaneous budget items |
| Bonus Calculator | Enter actual revenue → see bonus tier + per-staff estimates |

## Access control
- Everyone logged in can **view** all departments
- Each lead can only **edit** rows matching their department
- Admins (`is_admin = true`) can edit everything
