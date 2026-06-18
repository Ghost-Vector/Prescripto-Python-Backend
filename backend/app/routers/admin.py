import json
import time
from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException, status
from typing import List
from app.schemas import LoginRequest, DoctorChangeAvailabilityRequest, AppointmentCancelRequest
from app.security import create_access_token, get_password_hash
from app.dependencies import get_current_admin
from app.config import settings
import app.db as db

router = APIRouter()

@router.post("/login")
def login_admin(payload: LoginRequest):
    if payload.email == settings.ADMIN_EMAIL and payload.password == settings.ADMIN_PASSWORD:
        token = create_access_token(data={"sub": payload.email + payload.password})
        return {"success": True, "token": token}
    else:
        return {"success": False, "message": "Invalid credential"}

@router.post("/add-doctor")
async def add_doctor(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    speciality: str = Form(...),
    degree: str = Form(...),
    experience: str = Form(...),
    about: str = Form(...),
    fee: float = Form(...),
    address: str = Form(...),
    image: UploadFile = File(...),
    admin: str = Depends(get_current_admin)
):
    # Check if doctor already exists
    existing = db.get_doctor_by_email(email)
    if existing:
        return {"success": False, "message": "Doctor with this email already exists"}

    # Validation
    if len(password) < 8:
        return {"success": False, "message": "Password must be at least 8 characters"}

    # Upload to Cloudinary or fallback
    img_url = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
    if settings.CLOUDINARY_NAME and settings.CLOUDINARY_API_KEY:
        try:
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )
            contents = await image.read()
            upload_result = cloudinary.uploader.upload(contents, folder="doctors")
            img_url = upload_result.get("secure_url", img_url)
        except Exception as e:
            print("Cloudinary upload failed, using fallback URL. Error:", e)

    try:
        address_dict = json.loads(address)
    except Exception:
        address_dict = {"line1": address, "line2": ""}

    hashed_pw = get_password_hash(password)
    db.create_doctor(
        name=name,
        email=email,
        password=hashed_pw,
        image=img_url,
        speciality=speciality,
        degree=degree,
        experience=experience,
        about=about,
        fee=fee,
        address=address_dict
    )

    return {"success": True, "message": "Doctor added"}

@router.post("/all-doctors")
def all_doctors(admin: str = Depends(get_current_admin)):
    doctors = db.get_all_doctors()
    # Serialize doctor data without passwords and add fallback fields
    result = []
    for doc in doctors:
        result.append({
            "_id": str(doc["id"]),
            "id": doc["id"],
            "name": doc["name"],
            "email": doc["email"],
            "image": doc["image"],
            "speciality": doc["speciality"],
            "degree": doc["degree"],
            "experience": doc["experience"],
            "about": doc["about"],
            "available": doc["available"],
            "fee": doc["fee"],
            "fees": doc["fee"],
            "address": doc["address"],
            "slots_booked": doc["slots_booked"],
            "date": doc["date"]
        })
    return {"success": True, "doctors": result}

@router.post("/change-availability")
def change_availability(payload: DoctorChangeAvailabilityRequest, admin: str = Depends(get_current_admin)):
    doc = db.get_doctor_by_id(payload.docId)
    if not doc:
        return {"success": False, "message": "Doctor not found"}
    
    db.update_doctor_availability(payload.docId, not doc["available"])
    return {"success": True, "message": "Availability changed"}

@router.get("/appointments")
def appointment_admin(admin: str = Depends(get_current_admin)):
    appointments = db.get_all_appointments()
    result = []
    for app in appointments:
        result.append({
            "_id": str(app["id"]),
            "id": app["id"],
            "userId": app["userId"],
            "doctorId": app["doctorId"],
            "slotDate": app["slotDate"],
            "slotTime": app["slotTime"],
            "userData": app["userData"],
            "docData": app["docData"],
            "amount": app["amount"],
            "date": app["date"],
            "cancelled": app["cancelled"],
            "payment": app["payment"],
            "isCompleted": app["isCompleted"]
        })
    return {"success": True, "appointments": result}

@router.post("/cancel-appointment")
def cancel_appointment(payload: AppointmentCancelRequest, admin: str = Depends(get_current_admin)):
    app = db.get_appointment_by_id(payload.appointmentId)
    if not app:
        return {"success": False, "message": "Appointment not found"}
    
    if app["cancelled"]:
        return {"success": False, "message": "Appointment already cancelled"}
        
    if app["isCompleted"]:
        return {"success": False, "message": "Completed appointments cannot be cancelled"}

    # Update appointment
    db.update_appointment_status(payload.appointmentId, cancelled=True)

    # Free up doctor slot
    doc = db.get_doctor_by_id(app["doctorId"])
    if doc:
        slots = doc["slots_booked"] or {}
        if app["slotDate"] in slots and app["slotTime"] in slots[app["slotDate"]]:
            slots[app["slotDate"]].remove(app["slotTime"])
            db.update_doctor_slots(app["doctorId"], slots)
            
    return {"success": True, "message": "Appointment cancelled successfully"}

@router.get("/dashboard")
def dashboard_data(admin: str = Depends(get_current_admin)):
    doc_count = len(db.get_all_doctors())
    # Quick count queries
    user_count = db.get_users_count()
    app_count = db.get_appointments_count()
    
    # Get 5 latest appointments
    latest_apps = db.get_latest_appointments(5)
    latest_serialized = []
    for app in latest_apps:
        latest_serialized.append({
            "_id": str(app["id"]),
            "id": app["id"],
            "userId": app["userId"],
            "doctorId": app["doctorId"],
            "slotDate": app["slotDate"],
            "slotTime": app["slotTime"],
            "userData": app["userData"],
            "docData": app["docData"],
            "amount": app["amount"],
            "date": app["date"],
            "cancelled": app["cancelled"],
            "payment": app["payment"],
            "isCompleted": app["isCompleted"]
        })
        
    return {
        "success": True,
        "dashData": {
            "doctors": doc_count,
            "patients": user_count,
            "appointments": app_count,
            "latestAppointment": latest_serialized
        }
    }
