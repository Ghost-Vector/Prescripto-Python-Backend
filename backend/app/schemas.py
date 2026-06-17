from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None # Expect JSON string or parsed dict

class BookAppointmentRequest(BaseModel):
    docId: str
    slotDate: str
    slotTime: str

class AppointmentCancelRequest(BaseModel):
    appointmentId: str

class DoctorChangeAvailabilityRequest(BaseModel):
    docId: str

class TicketCreate(BaseModel):
    subject: str
    description: str
    category: str
    priority: str = "medium"

class TicketAssign(BaseModel):
    ticketId: int
    assignedTo: str

class TicketResolve(BaseModel):
    ticketId: int
    response: str
