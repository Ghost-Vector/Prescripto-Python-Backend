from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.schemas import TicketCreate, TicketAssign, TicketResolve
from app.dependencies import get_current_user, get_current_admin
import app.db as db

router = APIRouter()

# Patient (user) endpoints
@router.post("/create")
def create_ticket(
    payload: TicketCreate,
    user: dict = Depends(get_current_user)
):
    db.create_ticket(
        userId=user["id"],
        userName=user["name"],
        userEmail=user["email"],
        subject=payload.subject,
        description=payload.description,
        category=payload.category,
        priority=payload.priority
    )
    return {"success": True, "message": "Support ticket raised successfully"}

@router.get("/list")
def list_user_tickets(
    user: dict = Depends(get_current_user)
):
    tickets = db.get_tickets_by_user(user["id"])
    return {"success": True, "tickets": tickets}


# Admin endpoints
@router.get("/admin/list")
def list_all_tickets(
    admin: str = Depends(get_current_admin)
):
    tickets = db.get_all_tickets()
    return {"success": True, "tickets": tickets}

@router.post("/admin/assign")
def assign_ticket(
    payload: TicketAssign,
    admin: str = Depends(get_current_admin)
):
    ticket = next((t for t in db.get_all_tickets() if t["id"] == payload.ticketId), None)
    if not ticket:
        return {"success": False, "message": "Ticket not found"}
        
    db.assign_ticket(payload.ticketId, payload.assignedTo)
    return {"success": True, "message": f"Ticket assigned to {payload.assignedTo}"}

@router.post("/admin/resolve")
def resolve_ticket(
    payload: TicketResolve,
    admin: str = Depends(get_current_admin)
):
    ticket = next((t for t in db.get_all_tickets() if t["id"] == payload.ticketId), None)
    if not ticket:
        return {"success": False, "message": "Ticket not found"}
        
    db.resolve_ticket(payload.ticketId, payload.response)
    return {"success": True, "message": "Ticket marked as resolved with response"}

@router.get("/admin/report")
def get_tickets_report(
    admin: str = Depends(get_current_admin)
):
    tickets = db.get_all_tickets()
    
    total = len(tickets)
    open_count = sum(1 for t in tickets if t["status"] == "open")
    assigned_count = sum(1 for t in tickets if t["status"] == "assigned")
    resolved_count = sum(1 for t in tickets if t["status"] == "resolved")
    
    low = sum(1 for t in tickets if t["priority"] == "low")
    medium = sum(1 for t in tickets if t["priority"] == "medium")
    high = sum(1 for t in tickets if t["priority"] == "high")
    
    categories = {}
    for t in tickets:
        cat = t["category"]
        categories[cat] = categories.get(cat, 0) + 1
        
    return {
        "success": True,
        "report": {
            "total": total,
            "status": {
                "open": open_count,
                "assigned": assigned_count,
                "resolved": resolved_count
            },
            "priority": {
                "low": low,
                "medium": medium,
                "high": high
            },
            "categories": categories
        }
    }
