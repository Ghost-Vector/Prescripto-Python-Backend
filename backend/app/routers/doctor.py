import json
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.schemas import LoginRequest
from app.security import verify_password, create_access_token
from app.dependencies import get_current_doctor
import app.db as db

router = APIRouter()

@router.get("/list")
def list_doctors():
    doctors = db.get_all_doctors()
    result = []
    for doc in doctors:
        if doc["available"]:
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

@router.post("/login")
def doctor_login(payload: LoginRequest):
    doctor = db.get_doctor_by_email(payload.email)
    if not doctor:
        return {"success": False, "message": "Doctor not found"}
    
    if not verify_password(payload.password, doctor["password"]):
        return {"success": False, "message": "Invalid credentials"}
    
    token = create_access_token(data={"id": str(doctor["id"])})
    return {"success": True, "token": token}

@router.get("/appointments")
def appointment_doctor(doctor: dict = Depends(get_current_doctor)):
    appointments = db.get_appointments_by_doctor(doctor["id"])
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

@router.post("/complete-appoiappointment")
def complete_appointment(payload: dict, doctor: dict = Depends(get_current_doctor)):
    appointment_id = payload.get("appointmentId")
    if not appointment_id:
        return {"success": False, "message": "appointmentId required"}
        
    app = db.get_appointment_by_id(appointment_id)
    if not app or app["doctorId"] != str(doctor["id"]):
        return {"success": False, "message": "Appointment not found"}
        
    db.update_appointment_status(appointment_id, isCompleted=True)
    return {"success": True, "message": "Appointment Completed"}

@router.post("/cancel-appoiappointment")
def cancel_appointment(payload: dict, doctor: dict = Depends(get_current_doctor)):
    appointment_id = payload.get("appointmentId")
    if not appointment_id:
        return {"success": False, "message": "appointmentId required"}

    app = db.get_appointment_by_id(appointment_id)
    if not app or app["doctorId"] != str(doctor["id"]) or app["cancelled"] or app["isCompleted"]:
        return {"success": False, "message": "Appointment not found or cannot be cancelled"}
        
    db.update_appointment_status(appointment_id, cancelled=True)
    
    # Free slot
    slots = doctor["slots_booked"] or {}
    if app["slotDate"] in slots and app["slotTime"] in slots[app["slotDate"]]:
        slots[app["slotDate"]].remove(app["slotTime"])
        db.update_doctor_slots(doctor["id"], slots)
        
    return {"success": True, "message": "Appointment Cancelled successfully"}

@router.get("/dashboard")
def doctor_dashboard(doctor: dict = Depends(get_current_doctor)):
    appointments = db.get_appointments_by_doctor(doctor["id"])
    
    earnings = 0
    patient_ids = set()
    for app in appointments:
        if app["isCompleted"] or app["payment"]:
            earnings += app["amount"]
        patient_ids.add(app["userId"])
        
    # Get latest 5
    # SQL query for latest doctor appointments
    col_doctorId = "doctorId" if db.get_db_connection()[1] else '"doctorId"'
    latest_apps = db.execute_query(
        f"SELECT * FROM appointments WHERE {col_doctorId} = %s ORDER BY id DESC LIMIT 5",
        (str(doctor["id"]),),
        fetch_all=True
    )
    latest_serialized = []
    for app in latest_apps:
        app["userData"] = db.from_json_field(app.get("userData", "{}"))
        app["docData"] = db.from_json_field(app.get("docData", "{}"))
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
            "cancelled": bool(app["cancelled"]),
            "payment": bool(app["payment"]),
            "isCompleted": bool(app["isCompleted"])
        })
        
    return {
        "success": True,
        "dashData": {
            "earnings": earnings,
            "appointments": len(appointments),
            "patients": len(patient_ids),
            "latestAppointment": latest_serialized
        }
    }

@router.get("/profile")
def doctor_profile(doctor: dict = Depends(get_current_doctor)):
    profile = {
        "_id": str(doctor["id"]),
        "id": doctor["id"],
        "name": doctor["name"],
        "email": doctor["email"],
        "image": doctor["image"],
        "speciality": doctor["speciality"],
        "degree": doctor["degree"],
        "experience": doctor["experience"],
        "about": doctor["about"],
        "available": doctor["available"],
        "fee": doctor["fee"],
        "fees": doctor["fee"],
        "address": doctor["address"]
    }
    return {"success": True, "profileData": profile}

@router.post("/update-profile")
def update_profile(payload: dict, doctor: dict = Depends(get_current_doctor)):
    fee = payload.get("fee")
    address = payload.get("address")
    available = payload.get("available")
    
    db.update_doctor_profile(doctor["id"], fee=fee, address=address, available=available)
    return {"success": True, "message": "Profile Updated"}
