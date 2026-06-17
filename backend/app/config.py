import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Supabase HTTP REST API variables
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your_project.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "your_anon_or_service_role_key")
    
    CLOUDINARY_NAME: str = os.getenv("CLOUDINARY_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "aadmin@prescripto.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "qwery1234")
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", os.getenv("JWT_Secret", "IamprinceOg"))
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days

settings = Settings()
