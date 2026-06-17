-- PostgreSQL Schema for Supabase Integration
-- Doctor Appointment and Support Ticket System

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    image TEXT DEFAULT 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP...',
    address JSONB DEFAULT '{}'::jsonb,
    gender VARCHAR(50) DEFAULT 'Not Selected',
    phone VARCHAR(50) DEFAULT '0000000',
    dob VARCHAR(50) DEFAULT 'Not Selected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for User Email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Doctors Table
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

-- Index for Doctor Email
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);

-- 3. Appointments Table
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

-- 4. Support Tickets Table
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
