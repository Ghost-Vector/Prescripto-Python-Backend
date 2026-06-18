# Doctor Appointment & Support Ticket System (Monorepo)

A comprehensive, multi-role health platform that integrates a **Doctor Appointment Booking System** with a custom **Customer Support Ticket System**. 

This project consists of three main modules:
1. **`backend/`**: A high-performance Python FastAPI server connected directly to **Supabase** (PostgreSQL) using the official Supabase Client SDK.
2. **`frontend/`**: A React + Vite + Tailwind CSS portal for **Patients** to search specialties, book appointments, manage profiles, and raise support tickets.
3. **`admin/`**: A React + Vite + Tailwind CSS dashboard for **Administrators** to onboard doctors, manage slots, and resolve tickets, and for **Doctors** to view earnings, schedules, and profiles.

---

## 🛠️ Technology Stack

| Module | Technologies Used |
| :--- | :--- |
| **Backend API** | Python, FastAPI, Uvicorn, Supabase Client SDK, JWT (Jose), Cloudinary, Pydantic |
| **Client Frontend** | React.js, Vite, Tailwind CSS, React Router DOM, Context API, Axios |
| **Admin Dashboard** | React.js, Vite, Tailwind CSS, React Router DOM, Context API, Axios |
| **Database** | Supabase (PostgreSQL) |

---

## 📂 Structural Directory Map

Here is the file layout of the monorepo:

```
Dr_Appointmemt/
│
├── backend/                        # Python FastAPI Backend
│   ├── api/
│   │   └── index.py                # Serverless Vercel function entrypoint
│   ├── app/
│   │   ├── config.py               # Settings and Environment Variables loading
│   │   ├── db.py                   # Supabase REST client initialization & CRUD helpers
│   │   ├── dependencies.py         # JWT Token extractors (User, Doctor, Admin)
│   │   ├── models.py               # SQL database model references (unused in SDK mode)
│   │   ├── schemas.py              # Pydantic payloads validation
│   │   ├── security.py             # Password hashing (bcrypt) and JWT claims signing
│   │   └── routers/
│   │       ├── admin.py            # Onboard doctors, view appointments, dashboard stats
│   │       ├── doctor.py           # Doctor profiles, schedules, earnings dashboard
│   │       ├── user.py             # Patient registrations, bookings, profile updates
│   │       └── tickets.py          # Raise tickets, list tickets, assign, resolve, reports
│   ├── vercel.json                 # Vercel serverless build config
│   ├── requirements.txt            # Python dependencies
│   ├── schema.sql                  # PostgreSQL table definitions for Supabase SQL Editor
│   ├── setup_supabase.py           # Automatic table setup & MongoDB-to-Supabase migration
│   └── main.py                     # Local server startup script
│
├── frontend/                       # User-Facing Patient Web Application
│   ├── src/
│   │   ├── components/             # Reusable UI (Navbar, Footer, related doctors)
│   │   ├── context/                # AppState provider (VITE_BACKEND_URL Axios configs)
│   │   ├── pages/                  # Views: Home, Specialty Browse, Booking, Tickets
│   │   └── App.jsx                 # Client layout and routes
│   └── package.json
│
└── admin/                          # Control Panel for Admins & Doctors
    ├── src/
    │   ├── components/             # Sidebar and Header Navigation
    │   ├── context/                # Admin, Doctor, and App shared states
    │   ├── pages/
    │   │   ├── Admin/              # Add Doctors, List Appointments, Tickets Manager, Reports
    │   │   └── Doctor/             # Dashboard, Appointments calendar, Doctor Profile
    │   └── App.jsx                 # Dashboard router switcher
    └── package.json
```

---

## 💾 Step 1: Database Table Configuration (Supabase)

Before running the code, you must create the necessary tables in your Supabase project.

1. Create a free account at [Supabase](https://supabase.com/).
2. Create a new project.
3. Open your project dashboard, navigate to the **SQL Editor** tab (terminal icon in the left menu sidebar), and click **New Query**.
4. Copy and paste the entire SQL schema block below into the editor, then click **Run**:

```sql
-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    image TEXT DEFAULT 'data:image/png;base64,iVBORw0KGgoAAAAN...',
    address JSONB DEFAULT '{}'::jsonb,
    gender VARCHAR(50) DEFAULT 'Not Selected',
    phone VARCHAR(50) DEFAULT '0000000',
    dob VARCHAR(50) DEFAULT 'Not Selected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    image TEXT NOT NULL,
    speciality VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    experience VARCHAR(255) NOT NULL,
    about TEXT NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    fee DOUBLE PRECISION NOT NULL,
    address JSONB NOT NULL,
    slots_booked JSONB DEFAULT '{}'::jsonb,
    date BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "doctorId" VARCHAR(255) NOT NULL,
    "slotDate" VARCHAR(255) NOT NULL,
    "slotTime" VARCHAR(255) NOT NULL,
    "userData" JSONB NOT NULL,
    "docData" JSONB NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    date BIGINT NOT NULL,
    cancelled BOOLEAN DEFAULT FALSE,
    payment BOOLEAN DEFAULT FALSE,
    "isCompleted" BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Support Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "userName" VARCHAR(255) NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    "assignedTo" VARCHAR(255),
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Step 2: Migrating Existing MongoDB Data to Supabase

If you have existing data inside MongoDB, you can migrate it automatically to Supabase. This script handles relational mappings (MongoDB string ObjectIds ➔ Supabase auto-incrementing integer keys):

1. Set `DATABASE_URL` (direct PostgreSQL URI found in Supabase Database settings), `MONGODB_URI` (your Mongo connection string), `SUPABASE_URL`, and `SUPABASE_KEY` inside your [backend/.env](file:///P:/Projects/project placement/Dr_Appointmemt/backend/.env) file.
2. Run this inside the `backend/` folder:
   ```bash
   pip install -r requirements.txt
   python setup_supabase.py
   ```
*Note: If no MongoDB is running, the script will simply verify and create any missing Supabase PostgreSQL tables.*

---

## ⚙️ Step 3: Environment Setup

Create or update the `.env` configuration file inside each directory as shown below:

### A. Backend Variables (`backend/.env`)
Create [backend/.env](file:///P:/Projects/project placement/Dr_Appointmemt/backend/.env):
```env
# 1. Supabase Project Connections (Settings -> API)
SUPABASE_URL=https://your_project_ref.supabase.co
SUPABASE_KEY=your_supabase_project_anon_or_service_role_key

# 2. Database URI (For migration / local table generation)
DATABASE_URL=postgresql://postgres.[your-project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require

# 3. Security Signing Secret
JWT_Secret=IamprinceOg

# 4. Administrator Default Credentials
ADMIN_EMAIL=aadmin@prescripto.com
ADMIN_PASSWORD=qwery1234

# 5. Cloudinary Storage (Optional, fallbacks to placeholders if omitted)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### B. Patient Frontend Variables (`frontend/.env`)
Create [frontend/.env](file:///P:/Projects/project placement/Dr_Appointmemt/frontend/.env):
```env
VITE_BACKEND_URL=http://localhost:4000
```

### C. Admin Dashboard Variables (`admin/.env`)
Create [admin/.env](file:///P:/Projects/project placement/Dr_Appointmemt/admin/.env):
```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## 🏃 Step 4: Running the Monorepo Locally

You will need **three terminal windows** running simultaneously:

### Terminal 1: Run Backend API
```bash
cd backend
pip install -r requirements.txt
python main.py
```
* **API Documentation**: Open your browser to `http://localhost:4000/docs` to test endpoints via Swagger.

### Terminal 2: Run Patient App
```bash
cd frontend
npm install
npm run dev
```
* **Patient URL**: Open `http://localhost:5173`.

### Terminal 3: Run Admin Dashboard
```bash
cd admin
npm install
npm run dev
```
* **Admin/Doctor URL**: Open `http://localhost:5174`.

---

## 🌐 Step 5: Vercel Deployment Instructions

### 1. Deploy the Backend (`backend/`)
1. Import your GitHub repository into your Vercel Dashboard.
2. Select **Root Directory** as `backend`.
3. Set the **Framework Preset** to **Other** (Vercel will detect `api/index.py` and run it as a serverless Python function).
4. Add the **Environment Variables** (from `backend/.env` above: `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_Secret`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
5. Click **Deploy** and copy your deployed API URL (e.g., `https://your-backend.vercel.app`).

### 2. Deploy Patient Frontend (`frontend/`)
1. Import your repository into a new Vercel Project.
2. Set **Root Directory** as `frontend` and choose **Vite** (auto-detected).
3. Add the **Environment Variable** `VITE_BACKEND_URL` and paste your deployed backend URL.
4. Click **Deploy**.

### 3. Deploy Admin Panel (`admin/`)
1. Import your repository into a new Vercel Project.
2. Set **Root Directory** as `admin` and choose **Vite** (auto-detected).
3. Add the **Environment Variable** `VITE_BACKEND_URL` and paste your deployed backend URL.
4. Click **Deploy**.

---

## 📋 System Process Workflows

### 1. Doctor Onboarding & Availability
* **Process**: Admin logs into the Admin panel ➔ clicks "Add Doctor" ➔ fills details and uploads photo ➔ Doctor gets created. Admin can toggle doctor availability from "Doctor List" page, which immediately reflects on the Patient booking page.

### 2. Booking Appointments
* **Process**: Patient logs in ➔ selects doctor specialty ➔ clicks on a doctor ➔ selects date/time slot ➔ clicks "Book". The slot is appended to the doctor's calendar (`slots_booked` JSONB) to prevent double bookings.

### 3. Raising & Resolving Support Tickets
* **Process**: Patient navigates to "Support Tickets" via top-right avatar dropdown ➔ fills in Subject, Category, Priority, and Description ➔ clicks "Submit".
* **Resolution**: Admin goes to "Support Tickets" tab in the sidebar ➔ sees the ticket ➔ assigns it to a doctor email (or keeps it as Admin) ➔ writes a resolution response and clicks "Resolve". The status updates in the patient's view.
* **Analytics**: Admin clicks on "Ticket Reports" in the sidebar to view status percentages and priority bar graphs.
