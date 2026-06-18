import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the parent directory (backend/) to python system path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app.db import init_db
from app.routers import admin, doctor, user, tickets

# Initialize database
init_db()

app = FastAPI(
    title="Doctor Appointment & Support Ticket System API",
    description="FastAPI backend integrating doctor appointment bookings with user support tickets.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(doctor.router, prefix="/api/doctor", tags=["Doctor"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["Support Tickets"])

@app.get("/")
def read_root():
    return {"message": "Doctor Appointment & Support Ticket API is running!"}
