# Faculty Directory — Green University of Bangladesh

A full-stack faculty directory web application for Green University of Bangladesh, built with React, Vite, Tailwind CSS, and Supabase. Features a public-facing directory with department-wise browsing and a secure admin dashboard for managing faculty records.

---

## Features

### Public Directory
- **Department tabs** — Switch between all GUB departments using short-form codes (ENG, SOC, JMC, BBA, LAW, CSE, EEE, TE)
- **Live search** — Filter faculty by name, code, designation, email, or phone number
- **Faculty cards** — Photo, designation, status badge, code, email and phone on every card
- **Status badges** — Color-coded: Active (green), Study Leave (yellow), Formal (gray)
- **Pagination** — Smart ellipsis pagination across all department views
- **Dark / Light mode** — Theme toggle persisted to localStorage

### Admin Dashboard
- **Secure login** — Email and password authentication via Supabase Auth
- **Protected routes** — Non-authenticated users are redirected to login
- **Full CRUD** — Add, edit, and delete faculty records
- **Photo upload** — Drag & drop or click to upload photos directly from device; stored in Supabase Storage
- **Inline form** — Single form handles both create and update with live image preview

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion |
| Backend / DB | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Routing | React Router v7 |
| Icons | React Icons |

---

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Sticky header with dept tabs, search, theme toggle
│   ├── Main.jsx            # Faculty grid — filtered, paginated, dark-mode aware
│   ├── Footer.jsx          # Footer
│   ├── SearchBar.jsx       # Reusable search input
│   ├── Pagination.jsx      # Smart ellipsis pagination
│   └── ProtectedRoute.jsx  # Auth guard for admin routes
├── constants/
│   └── departments.js      # Department definitions (short code → DB value)
├── pages/
│   ├── Login.jsx           # Admin login page
│   └── AdminDashboard.jsx  # CRUD dashboard with photo upload
├── supabaseClient.js       # Supabase client initialisation
├── App.jsx                 # Router + shared state (theme, dept, search, page)
├── index.css               # Tailwind directives
└── main.jsx                # Entry point
```

---

## Database Schema

Table: `faculty_members`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Auto-generated primary key |
| `name` | text | Required |
| `designation` | text | Required |
| `code` | text | Short identifier e.g. `SA`, `DAMR` |
| `contact_no` | text | Phone number |
| `email` | text | Required |
| `img_src` | text | Supabase Storage public URL |
| `department` | text | Required — used for dept-tab grouping |
| `status` | text | `active` · `leave_study` · `formal` |
| `created_at` | timestamptz | Auto-set on insert |

> Two more tables (`profiles`, `faculty_change_requests`) are added by the optional [superadmin approval workflow](#3b-optional-superadmin-approval-workflow) — see `supabase/superadmin_approval.sql`.

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd FacultyDirectory-main
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Use only the **anon/publishable key** here — never the service role key.

### 3. Set up Supabase

Run the following in your Supabase **SQL Editor**:

```sql
CREATE TABLE faculty_members (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  designation text NOT NULL,
  code        text,
  contact_no  text,
  email       text NOT NULL,
  img_src     text,
  department  text NOT NULL,
  status      text NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'leave_study', 'formal')),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE faculty_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read"  ON faculty_members FOR SELECT USING (true);
CREATE POLICY "auth_write"   ON faculty_members FOR ALL    USING (auth.role() = 'authenticated');
```

Then create the photo storage bucket:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('faculty-images', 'faculty-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "public read images"  ON storage.objects FOR SELECT USING (bucket_id = 'faculty-images');
CREATE POLICY "auth upload images"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'faculty-images' AND auth.role() = 'authenticated');
CREATE POLICY "auth update images"  ON storage.objects FOR UPDATE USING   (bucket_id = 'faculty-images' AND auth.role() = 'authenticated');
CREATE POLICY "auth delete images"  ON storage.objects FOR DELETE USING   (bucket_id = 'faculty-images' AND auth.role() = 'authenticated');
```

Create an admin user under **Authentication → Users** in the Supabase dashboard.

### 3b. (Optional) Superadmin approval workflow

By default every authenticated user can write directly to `faculty_members`. To require a **superadmin** to review and approve every admin's add/edit/delete before it appears on the public site, run [`supabase/superadmin_approval.sql`](supabase/superadmin_approval.sql) in the SQL Editor. It adds:

- A `profiles` table holding each user's `role` (`admin` or `superadmin`, defaulting to `admin` via a trigger on signup)
- A `faculty_change_requests` table — the approval queue that stores proposed inserts/updates/deletes with their status (`pending` / `approved` / `rejected`)
- A tightened `faculty_members` write policy so only `superadmin` accounts can write to it directly (enforced at the database level via RLS, not just hidden in the UI)

After running it, promote yourself with:

```sql
UPDATE profiles SET role = 'superadmin' WHERE email = 'you@example.com';
```

Plain `admin` accounts then see **"Submit for Approval"** instead of **"Add/Update Member"** in the dashboard, and a **"Pending Approvals"** panel lets superadmins review, approve, or reject each request.

### 4. Run locally

```bash
npm run dev
```

App runs at `http://localhost:5173`

| Route | Description |
|---|---|
| `/` | Public faculty directory |
| `/login` | Admin login |
| `/admin` | Protected CRUD dashboard |

### 5. Build for production

```bash
npm run build
```

---

## Departments

| Code | Full Name |
|---|---|
| ENG | Department of English |
| SOC | Department of Sociology and Anthropology |
| JMC | Department of Journalism and Media Communication |
| BBA | Department of Business Administration |
| LAW | Department of Law |
| CSE | Department of Computer Science and Engineering |
| EEE | Department of Electrical and Electronic Engineering |
| TE | Department of Textile Engineering |

---

## License

This project is open-source and available under the MIT License.
