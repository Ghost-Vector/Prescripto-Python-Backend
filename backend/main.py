import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.routers import admin, doctor, user, tickets

# Automatically create all tables on startup (works on local SQLite and Supabase PostgreSQL)
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=4000, reload=True)
