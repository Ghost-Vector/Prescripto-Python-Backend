import json
import time
from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException, status
from typing import Optional
from app.schemas import UserRegister, LoginRequest, BookAppointmentRequest, AppointmentCancelRequest
from app.security import get_password_hash, verify_password, create_access_token
from app.dependencies import get_current_user
from app.config import settings
import app.db as db

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister):
    if not payload.name or not payload.email or not payload.password:
        return {"success": False, "message": "All fields are required"}
    
    # Check if user exists
    existing = db.get_user_by_email(payload.email)
    if existing:
        return {"success": False, "message": "Email already registered"}
    
    if len(payload.password) < 8:
        return {"success": False, "message": "Password must be at least 8 characters"}
    
    hashed_pw = get_password_hash(payload.password)
    user = db.create_user(payload.name, payload.email, hashed_pw)
    
    token = create_access_token(data={"id": str(user["id"])})
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@router.post("/login")
def login_user(payload: LoginRequest):
    if not payload.email or not payload.password:
        return {"success": False, "message": "Email and password are required"}
        
    user = db.get_user_by_email(payload.email)
    if not user:
        return {"success": False, "message": "Invalid credentials"}
        
    if not verify_password(payload.password, user["password"]):
        return {"success": False, "message": "Invalid credentials"}
        
    token = create_access_token(data={"id": str(user["id"])})
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@router.get("/get-profile")
def get_profile(user: dict = Depends(get_current_user)):
    profile = {
        "_id": str(user["id"]),
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "image": user["image"],
        "address": user["address"],
        "gender": user["gender"],
        "phone": user["phone"],
        "dob": user["dob"]
    }
    return {"success": True, "userData": profile}

@router.post("/update-profile")
async def update_profile(
    name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    dob: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user)
):
    address_dict = None
    if address is not None:
        try:
            address_dict = json.loads(address)
        except Exception:
            address_dict = {"line1": address, "line2": ""}
            
    img_url = None
    if image is not None:
        img_url = user["image"]
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
                upload_result = cloudinary.uploader.upload(contents, folder="users")
                img_url = upload_result.get("secure_url", img_url)
            except Exception as e:
                print("Cloudinary user photo upload failed. Error:", e)
        else:
            img_url = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"

    updated_user = db.update_user_profile(
        user["id"],
        name=name,
        phone=phone,
        dob=dob,
        gender=gender,
        address=address_dict,
        image=img_url
    )
    
    profile = {
        "_id": str(updated_user["id"]),
        "id": updated_user["id"],
        "name": updated_user["name"],
        "email": updated_user["email"],
        "image": updated_user["image"],
        "address": updated_user["address"],
        "gender": updated_user["gender"],
        "phone": updated_user["phone"],
        "dob": updated_user["dob"]
    }
    return {"success": True, "message": "Profile updated successfully", "userData": profile}

@router.post("/book-appointment")
def book_appointment(payload: BookAppointmentRequest, user: dict = Depends(get_current_user)):
    doc = db.get_doctor_by_id(payload.docId)
    if not doc or not doc["available"]:
        return {"success": False, "message": "Doctor not available"}
        
    slots = doc["slots_booked"] or {}
    
    # Check if slot already booked
    if payload.slotDate in slots and payload.slotTime in slots[payload.slotDate]:
        return {"success": False, "message": "Slot not available"}
        
    user_snapshot = {
        "_id": str(user["id"]),
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "image": user["image"],
        "phone": user["phone"]
    }
    
    doc_snapshot = {
        "_id": str(doc["id"]),
        "id": doc["id"],
        "name": doc["name"],
        "speciality": doc["speciality"],
        "image": doc["image"],
        "fee": doc["fee"],
        "fees": doc["fee"],
        "address": doc["address"]
    }
    
    db.create_appointment(
        userId=user["id"],
        doctorId=doc["id"],
        slotDate=payload.slotDate,
        slotTime=payload.slotTime,
        userData=user_snapshot,
        docData=doc_snapshot,
        amount=doc["fee"]
    )
    
    # Update doctor slots
    if payload.slotDate not in slots:
        slots[payload.slotDate] = []
    slots[payload.slotDate].append(payload.slotTime)
    db.update_doctor_slots(doc["id"], slots)
    
    return {"success": True, "message": "Appointment booked successfully"}

@router.get("/appointment")
def list_appointments(user: dict = Depends(get_current_user)):
    appointments = db.get_appointments_by_user(user["id"])
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
def cancel_appointment(payload: AppointmentCancelRequest, user: dict = Depends(get_current_user)):
    app = db.get_appointment_by_id(payload.appointmentId)
    if not app or app["userId"] != str(user["id"]) or app["cancelled"]:
        return {"success": False, "message": "Appointment not found or already cancelled"}
        
    db.update_appointment_status(payload.appointmentId, cancelled=True)
    
    # Free slot
    doc = db.get_doctor_by_id(app["doctorId"])
    if doc:
        slots = doc["slots_booked"] or {}
        if app["slotDate"] in slots and app["slotTime"] in slots[app["slotDate"]]:
            slots[app["slotDate"]].remove(app["slotTime"])
            db.update_doctor_slots(doc["id"], slots)
            
    return {"success": True, "message": "Appointment cancelled successfully"}
