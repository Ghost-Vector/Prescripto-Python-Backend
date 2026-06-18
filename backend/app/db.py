import time
from datetime import datetime
from supabase import create_client, Client
from app.config import settings

supabase: Client = None

# Initialize the Supabase Client
try:
    if settings.SUPABASE_URL and "your_project" not in settings.SUPABASE_URL:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    else:
        print("WARNING: Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_KEY in .env.")
except Exception as e:
    print("WARNING: Failed to connect to Supabase:", e)

def check_client():
    if supabase is None:
        raise Exception("Supabase is not configured. Please add SUPABASE_URL and SUPABASE_KEY to your .env file.")

# Helper to mock empty DB values if client is not configured (prevent startup crashes)
def init_db():
    pass

# Users CRUD
def get_user_by_email(email):
    check_client()
    res = supabase.table("users").select("*").eq("email", email).execute()
    return res.data[0] if res.data else None

def get_user_by_id(user_id):
    check_client()
    res = supabase.table("users").select("*").eq("id", int(user_id)).execute()
    return res.data[0] if res.data else None

def create_user(name, email, password):
    check_client()
    res = supabase.table("users").insert({
        "name": name,
        "email": email,
        "password": password,
        "address": {},
        "gender": "Not Selected",
        "phone": "0000000",
        "dob": "Not Selected"
    }).execute()
    return res.data[0] if res.data else None

def update_user_profile(user_id, name=None, phone=None, dob=None, gender=None, address=None, image=None):
    check_client()
    updates = {}
    if name is not None:
        updates["name"] = name
    if phone is not None:
        updates["phone"] = phone
    if dob is not None:
        updates["dob"] = dob
    if gender is not None:
        updates["gender"] = gender
    if address is not None:
        updates["address"] = address
    if image is not None:
        updates["image"] = image
        
    res = supabase.table("users").update(updates).eq("id", int(user_id)).execute()
    return res.data[0] if res.data else None


# Doctors CRUD
def get_doctor_by_email(email):
    check_client()
    res = supabase.table("doctors").select("*").eq("email", email).execute()
    return res.data[0] if res.data else None

def get_doctor_by_id(doc_id):
    check_client()
    res = supabase.table("doctors").select("*").eq("id", int(doc_id)).execute()
    return res.data[0] if res.data else None

def get_all_doctors():
    check_client()
    res = supabase.table("doctors").select("*").execute()
    return res.data or []

def create_doctor(name, email, password, image, speciality, degree, experience, about, fee, address):
    check_client()
    res = supabase.table("doctors").insert({
        "name": name,
        "email": email,
        "password": password,
        "image": image,
        "speciality": speciality,
        "degree": degree,
        "experience": experience,
        "about": about,
        "fee": fee,
        "address": address,
        "slots_booked": {},
        "date": int(time.time() * 1000)
    }).execute()
    return res.data[0] if res.data else None

def update_doctor_availability(doc_id, available):
    check_client()
    res = supabase.table("doctors").update({"available": bool(available)}).eq("id", int(doc_id)).execute()
    return res.data[0] if res.data else None

def update_doctor_profile(doc_id, fee=None, address=None, available=None):
    check_client()
    updates = {}
    if fee is not None:
        updates["fee"] = float(fee)
    if address is not None:
        updates["address"] = address
    if available is not None:
        updates["available"] = bool(available)
        
    res = supabase.table("doctors").update(updates).eq("id", int(doc_id)).execute()
    return res.data[0] if res.data else None

def update_doctor_slots(doc_id, slots):
    check_client()
    supabase.table("doctors").update({"slots_booked": slots}).eq("id", int(doc_id)).execute()


# Appointments CRUD
def create_appointment(userId, doctorId, slotDate, slotTime, userData, docData, amount):
    check_client()
    supabase.table("appointments").insert({
        "userId": str(userId),
        "doctorId": str(doctorId),
        "slotDate": slotDate,
        "slotTime": slotTime,
        "userData": userData,
        "docData": docData,
        "amount": amount,
        "date": int(time.time() * 1000),
        "cancelled": False,
        "payment": False,
        "isCompleted": False
    }).execute()

def get_appointment_by_id(app_id):
    check_client()
    res = supabase.table("appointments").select("*").eq("id", int(app_id)).execute()
    return res.data[0] if res.data else None

def get_appointments_by_user(user_id):
    check_client()
    res = supabase.table("appointments").select("*").eq("userId", str(user_id)).execute()
    return res.data or []

def get_appointments_by_doctor(doc_id):
    check_client()
    res = supabase.table("appointments").select("*").eq("doctorId", str(doc_id)).execute()
    return res.data or []

def get_all_appointments():
    check_client()
    res = supabase.table("appointments").select("*").execute()
    return res.data or []

def get_latest_appointments(limit=5):
    check_client()
    res = supabase.table("appointments").select("*").order("id", desc=True).limit(limit).execute()
    return res.data or []

def get_appointments_count():
    check_client()
    res = supabase.table("appointments").select("id", count="exact").execute()
    return res.count if res.count is not None else len(res.data or [])

def update_appointment_status(app_id, cancelled=None, isCompleted=None):
    check_client()
    updates = {}
    if cancelled is not None:
        updates["cancelled"] = bool(cancelled)
    if isCompleted is not None:
        updates["isCompleted"] = bool(isCompleted)
        
    supabase.table("appointments").update(updates).eq("id", int(app_id)).execute()


# Tickets CRUD
def create_ticket(userId, userName, userEmail, subject, description, category, priority):
    check_client()
    supabase.table("tickets").insert({
        "userId": str(userId),
        "userName": userName,
        "userEmail": userEmail,
        "subject": subject,
        "description": description,
        "category": category,
        "priority": priority,
        "status": "open"
    }).execute()

def get_tickets_by_user(user_id):
    check_client()
    res = supabase.table("tickets").select("*").eq("userId", str(user_id)).order("id", desc=True).execute()
    return res.data or []

def get_all_tickets():
    check_client()
    res = supabase.table("tickets").select("*").order("id", desc=True).execute()
    return res.data or []

def assign_ticket(ticket_id, assigned_to):
    check_client()
    supabase.table("tickets").update({
        "assignedTo": assigned_to,
        "status": "assigned"
    }).eq("id", int(ticket_id)).execute()

def resolve_ticket(ticket_id, response):
    check_client()
    supabase.table("tickets").update({
        "response": response,
        "status": "resolved"
    }).eq("id", int(ticket_id)).execute()

def get_users_count():
    check_client()
    res = supabase.table("users").select("id", count="exact").execute()
    return res.count if res.count is not None else len(res.data or [])

def get_latest_appointments_by_doctor(doc_id, limit=5):
    check_client()
    res = supabase.table("appointments").select("*").eq("doctorId", str(doc_id)).order("id", desc=True).limit(limit).execute()
    return res.data or []
