# Doctor Appointment & Support Ticket System - Python FastAPI Backend

This is the converted Python FastAPI backend for the Doctor Appointment System, featuring an integrated Support Ticket management system. The database uses **Supabase** (PostgreSQL) integrated via the official **Supabase Client SDK** (Postgrest HTTP Client) for direct, lightweight, schema-agnostic CRUD operations.

---

## 🚀 Key Features
1. **FastAPI & Uvicorn**: High-performance asynchronous routing.
2. **Supabase Python Client Integration**: Lightweight HTTP-based API queries using `supabase-py`.
3. **JWT Authentication**: Protected routes for Patients, Doctors, and Administrators.
4. **Support Ticket System**: Complete CRUD APIs for users to raise tickets and admins to manage, assign, resolve, and view analytics reports.
5. **Cloudinary Integration**: Optional Cloudinary file uploading for doctor profiles and patient pictures.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
Ensure you have Python 3.10+ installed.

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` folder (or update the existing one):
```env
# Supabase Project Connection Details (Settings -> API)
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_role_key

# JWT Configuration
JWT_Secret=IamprinceOg

# Admin Credentials
ADMIN_EMAIL=aadmin@prescripto.com
ADMIN_PASSWORD=qwery1234

# Optional: Cloudinary Credentials (if not set, fallbacks to placeholder profile images)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Install Dependencies
Run the following command in the `backend/` directory:
```bash
pip install -r requirements.txt
```

### 4. Run the Server
Start the FastAPI server:
```bash
python main.py
```
The server will start at `http://localhost:4000`. You can access the automatic Swagger API documentation at `http://localhost:4000/docs`.

---

## 💾 Database Schema Setup (Supabase)
To set up the required tables inside your Supabase project, execute the SQL commands found in [schema.sql](schema.sql) in your **Supabase Dashboard SQL Editor**.

---

## 🧪 Testing the API
We have provided a comprehensive Postman Collection for all API endpoints:
* Load the [doctor_appointment_tickets.postman_collection.json](doctor_appointment_tickets.postman_collection.json) file directly into Postman.
* Set the environment variables `user_token` and `admin_token` returned by login responses to run authenticated routes.
