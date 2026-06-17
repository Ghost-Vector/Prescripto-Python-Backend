from fastapi import Header, HTTPException, Depends, status
from typing import Optional
from app.db import get_user_by_id, get_doctor_by_id
from app.security import decode_token
from app.config import settings

def get_current_admin(atoken: Optional[str] = Header(None, alias="atoken")) -> str:
    if not atoken:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization denied - no admin token provided"
        )
    payload = decode_token(atoken)
    if not payload or payload.get("sub") != settings.ADMIN_EMAIL + settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization denied - invalid admin token"
        )
    return settings.ADMIN_EMAIL

def get_current_doctor(
    dtoken: Optional[str] = Header(None, alias="dtoken")
) -> dict:
    if not dtoken:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization denied - no doctor token provided"
        )
    payload = decode_token(dtoken)
    if not payload or "id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization denied - invalid doctor token"
        )
    
    doctor_id = payload["id"]
    doctor = get_doctor_by_id(doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Doctor account not found"
        )
    return doctor

def get_current_user(
    authorization: Optional[str] = Header(None)
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization denied - invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or "id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization denied - invalid user token"
        )
    
    user_id = payload["id"]
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found"
        )
    return user
