import os
import sys
import json
import time
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Read config from .env
db_url = os.getenv("DATABASE_URL")
mongo_uri = os.getenv("MONGODB_URI")

if not db_url or "your_supabase" in db_url:
    print("Error: DATABASE_URL is not set in backend/.env. Please configure your Supabase connection string.")
    sys.exit(1)

# Ensure proper protocol prefix for SQLAlchemy/psycopg2
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

print("Connecting to Supabase PostgreSQL...")
try:
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    print("Successfully connected to Supabase Database.")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    sys.exit(1)

# 1. CREATE TABLES AND SCHEMAS
print("\n--- 1. Creating Database Schema ---")
table_queries = [
    # Users Table
    """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        image TEXT DEFAULT 'data:image/png;base64,iVBORw0KGgoAAA...',
        address JSONB DEFAULT '{}'::jsonb,
        gender VARCHAR(50) DEFAULT 'Not Selected',
        phone VARCHAR(50) DEFAULT '0000000',
        dob VARCHAR(50) DEFAULT 'Not Selected',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    # Doctors Table
    """
    CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        speciality VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        experience VARCHAR(255) NOT NULL,
        about TEXT NOT NULL,
        available BOOLEAN DEFAULT TRUE,
        fee DOUBLE PRECISION NOT NULL,
        address JSONB NOT NULL,
        slots_booked JSONB DEFAULT '{}'::jsonb,
        date BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    # Appointments Table
    """
    CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        "doctorId" VARCHAR(255) NOT NULL,
        "slotDate" VARCHAR(255) NOT NULL,
        "slotTime" VARCHAR(255) NOT NULL,
        "userData" JSONB NOT NULL,
        "docData" JSONB NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        date BIGINT NOT NULL,
        cancelled BOOLEAN DEFAULT FALSE,
        payment BOOLEAN DEFAULT FALSE,
        "isCompleted" BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    # Support Tickets Table
    """
    CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        "userName" VARCHAR(255) NOT NULL,
        "userEmail" VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(255) NOT NULL,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        "assignedTo" VARCHAR(255),
        response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
]

for idx, q in enumerate(table_queries):
    try:
        cursor.execute(q)
        conn.commit()
        print(f"Schema query {idx+1} executed successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error executing schema query {idx+1}: {e}")

# 2. RUN DATA MIGRATION FROM MONGODB
print("\n--- 2. Connecting to MongoDB ---")
try:
    from pymongo import MongoClient
    mongo_client = MongoClient(mongo_uri)
    # Extract DB name from URI or use default
    db_name = "test"
    if "/" in mongo_uri.split("://")[-1]:
        parts = mongo_uri.split("/")
        if len(parts) > 1 and parts[-1].split("?")[0]:
            db_name = parts[-1].split("?")[0]
            
    mongo_db = mongo_client[db_name]
    print(f"Successfully connected to MongoDB Database: '{db_name}'.")
except Exception as e:
    print(f"MongoDB connection skipped or failed: {e}")
    print("Migration finished with schema creation only.")
    cursor.close()
    conn.close()
    sys.exit(0)

# Mappings for ObjectId -> Supabase Serial ID
user_mapping = {}
doc_mapping = {}

# Migrate Users
print("\nMigrating Users...")
try:
    mongo_users = list(mongo_db["users"].find({}))
    print(f"Found {len(mongo_users)} users in MongoDB.")
    for u in mongo_users:
        email = u.get("email")
        mongo_id = str(u["_id"])
        
        # Check if already in Supabase
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        row = cursor.fetchone()
        if row:
            supabase_id = row[0]
            print(f"User {email} already exists in Supabase (ID: {supabase_id}).")
        else:
            # Insert new user
            address = u.get("address", {})
            if isinstance(address, str):
                try:
                    address = json.loads(address)
                except Exception:
                    address = {"line1": address, "line2": ""}
            
            cursor.execute(
                """
                INSERT INTO users (name, email, password, image, address, gender, phone, dob)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                """,
                (
                    u.get("name", ""),
                    email,
                    u.get("password", ""),
                    u.get("image", "data:image/png;base64,iVBORw0KGgoAAA..."),
                    json.dumps(address),
                    u.get("gender", "Not Selected"),
                    u.get("phone", "0000000"),
                    u.get("dob", "Not Selected")
                )
            )
            supabase_id = cursor.fetchone()[0]
            conn.commit()
            print(f"Migrated User: {email} -> Supabase ID: {supabase_id}")
            
        user_mapping[mongo_id] = str(supabase_id)
except Exception as e:
    print(f"Error migrating users: {e}")

# Migrate Doctors
print("\nMigrating Doctors...")
try:
    mongo_docs = list(mongo_db["doctors"].find({}))
    print(f"Found {len(mongo_docs)} doctors in MongoDB.")
    for d in mongo_docs:
        email = d.get("email")
        mongo_id = str(d["_id"])
        
        # Check if already in Supabase
        cursor.execute("SELECT id FROM doctors WHERE email = %s", (email,))
        row = cursor.fetchone()
        if row:
            supabase_id = row[0]
            print(f"Doctor {email} already exists in Supabase (ID: {supabase_id}).")
        else:
            address = d.get("address", {})
            if isinstance(address, str):
                try:
                    address = json.loads(address)
                except Exception:
                    address = {"line1": address, "line2": ""}
                    
            slots = d.get("slots_booked", {})
            if isinstance(slots, str):
                try:
                    slots = json.loads(slots)
                except Exception:
                    slots = {}

            cursor.execute(
                """
                INSERT INTO doctors (name, email, password, image, speciality, degree, experience, about, available, fee, address, slots_booked, date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                """,
                (
                    d.get("name", ""),
                    email,
                    d.get("password", ""),
                    d.get("image", ""),
                    d.get("speciality", ""),
                    d.get("degree", ""),
                    d.get("experience", ""),
                    d.get("about", ""),
                    d.get("available", True),
                    float(d.get("fee", d.get("fees", 0))),
                    json.dumps(address),
                    json.dumps(slots),
                    int(d.get("date", time.time() * 1000))
                )
            )
            supabase_id = cursor.fetchone()[0]
            conn.commit()
            print(f"Migrated Doctor: {email} -> Supabase ID: {supabase_id}")
            
        doc_mapping[mongo_id] = str(supabase_id)
except Exception as e:
    print(f"Error migrating doctors: {e}")

# Migrate Appointments
print("\nMigrating Appointments...")
try:
    # Check if collection name is appointments or appointements (typo support)
    coll_name = "appointments" if "appointments" in mongo_db.list_collection_names() else "appointements"
    mongo_apps = list(mongo_db[coll_name].find({}))
    print(f"Found {len(mongo_apps)} appointments in MongoDB collection '{coll_name}'.")
    
    migrated_count = 0
    for app in mongo_apps:
        mongo_user_id = app.get("userId")
        mongo_doc_id = app.get("doctorId")
        
        # Map IDs using mappings
        supabase_user_id = user_mapping.get(mongo_user_id)
        supabase_doc_id = doc_mapping.get(mongo_doc_id)
        
        if not supabase_user_id or not supabase_doc_id:
            print(f"Skipping Appointment {app['_id']}: User or Doctor mapping missing.")
            continue
            
        slot_date = app.get("slotDate")
        slot_time = app.get("slotTime")
        
        # Check if appointment already exists in Supabase
        cursor.execute(
            """
            SELECT id FROM appointments 
            WHERE "userId" = %s AND "doctorId" = %s AND "slotDate" = %s AND "slotTime" = %s
            """, 
            (supabase_user_id, supabase_doc_id, slot_date, slot_time)
        )
        if cursor.fetchone():
            print(f"Appointment on {slot_date} at {slot_time} already exists in Supabase.")
            continue
            
        user_data = app.get("userData", {})
        doc_data = app.get("docData", {})
        
        # Update IDs inside snapshot data
        user_data["id"] = int(supabase_user_id)
        user_data["_id"] = supabase_user_id
        doc_data["id"] = int(supabase_doc_id)
        doc_data["_id"] = supabase_doc_id
        
        cursor.execute(
            """
            INSERT INTO appointments ("userId", "doctorId", "slotDate", "slotTime", "userData", "docData", amount, date, cancelled, payment, "isCompleted")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                supabase_user_id,
                supabase_doc_id,
                slot_date,
                slot_time,
                json.dumps(user_data),
                json.dumps(doc_data),
                float(app.get("amount", 0)),
                int(app.get("date", time.time() * 1000)),
                app.get("cancelled", False),
                app.get("payment", False),
                app.get("isCompleted", False)
            )
        )
        conn.commit()
        migrated_count += 1
        
    print(f"Successfully migrated {migrated_count} appointments to Supabase.")
except Exception as e:
    print(f"Error migrating appointments: {e}")

cursor.close()
conn.close()
print("\nDatabase Schema creation and Data Migration completed successfully.")
