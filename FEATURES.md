# 🏥 System Features Guide

Welcome to the **Doctor Appointment & Support Ticket System** features guide. This document outlines every single feature, workflow, and capability built into the three interfaces of this application: the **Patient Web Portal**, the **Admin Dashboard**, and the **Doctor Console**.

---

## 🛠️ Core Technology Stack & Architecture

* **Backend API**: Python 3.12, FastAPI (high-performance asynchronous framework), native `bcrypt` hashing, and JWT token authentication.
* **Database Layer**: Supabase (PostgreSQL relational database) using the official `supabase` Client SDK for raw CRUD operations.
* **Storage Provider**: Cloudinary API (used for storing and serving patient and doctor profile pictures).
* **Frontends**: React 18, Vite (fast build tool), Tailwind CSS (sleek, modern layouts), Axios (HTTP requests), and React Toastify (elegant toast notifications).

---

## 1. 🧑‍🤝‍🧑 Patient Web Portal (Frontend)

The patient portal allows users to discover doctors, book appointments, manage profiles, and resolve issues via the Helpdesk Support Ticket System.

### A. Authentication & Onboarding
* **Sign Up (Registration)**:
  * Users can register with their **Name**, **Email**, and a secure **Password** (minimum 8 characters).
  * Hashes passwords using native `bcrypt` on the backend before storing them in Supabase.
* **Sign In (Login)**:
  * Logs in using email and password. Returns a secure JSON Web Token (JWT).
  * Stores token in the browser's `localStorage` as `token` to persist sessions.
* **Sign Out**:
  * Clears the JWT token from storage and redirects the user to the landing page.

### B. Doctor Discovery & Profiles
* **Specialty-Based Filtering**:
  * Quick-access filtering tabs let patients view doctors by categories:
    * *General Physician*, *Gynecologist*, *Dermatologist*, *Pediatrician*, *Neurologist*, *Gastroenterologist*.
* **Doctor Profiles**:
  * Displays the doctor's name, qualifications (Degree), years of experience, a description ("About"), consultation fee, address, and current availability status.
  * Hides unavailable doctors from the discovery page.

### C. Appointment Booking
* **Interactive Slot Picker**:
  * Patients can select an appointment date (up to 7 days in advance) and choose from active 30-minute time slots (e.g., `10:30 am`, `02:00 pm`).
* **Double-Booking Prevention**:
  * Once a slot is booked, that specific date/time is dynamically added to the doctor's `slots_booked` record in the database.
  * Other patients will immediately see this slot disabled to prevent double bookings.

### D. Appointment Management Dashboard
* **Appointment Tracking**:
  * Displays the doctor's photo, specialty, address, booked date/time, and fee.
* **Status Flags**:
  * Shows if the appointment is **Completed** (green badge) or **Cancelled** (red badge).
* **Cancellation Capability**:
  * Patients can cancel their upcoming appointments. This automatically frees up the date/time slot on the doctor's calendar so other users can book it.
* **Payment Integration Mock**:
  * Option to pay online (marked as paid in the database).

### E. Helpdesk Support Ticket System
* **Ticket Submission**:
  * Patients can open a ticket when facing an issue.
  * Form fields include:
    * **Subject**: Short summary of the problem.
    * **Description**: Detailed description of the issue.
    * **Category**: Dropdown to select category (*Appointment Issue*, *Payment Issue*, *Technical Error*, *Other*).
    * **Priority**: Choose severity (*Low*, *Medium*, *High*).
* **Ticket Tracking Center**:
  * Displays a list of all tickets submitted by the logged-in user.
  * Each ticket displays its **Status** badge:
    * 🟡 `open`: Ticket raised, awaiting review.
    * 🔵 `assigned`: Ticket assigned to a doctor or support representative.
    * 🟢 `resolved`: Ticket marked resolved.
  * Shows the **Priority** and **Category** badges.
  * If the ticket is resolved, the admin's reply/resolution text is rendered directly inside the card for the patient to view.

---

## 2. 👑 Admin Dashboard (Admin Panel)

The Admin panel provides a system-wide overview of operations, doctor onboarding, appointment management, and support ticket resolution.

### A. Secure Authentication
* **Admin Login**:
  * Uses root admin credentials (`ADMIN_EMAIL` and `ADMIN_PASSWORD` defined in the backend `.env`).
  * Generates a separate admin token (`aToken`) stored in `localStorage`.

### B. Dashboard Analytics Overview
* **Quick Counters**:
  * Displays total active doctors in the system.
  * Displays total registered patients.
  * Displays total booked appointments.
* **Latest Bookings**:
  * Displays a list of the 5 most recent appointments across all doctors, with quick cancellation buttons.

### C. Doctor Onboarding & Management
* **Add Doctor Portal**:
  * Administrators can register new doctors by uploading an image (sent directly to Cloudinary) and inputting their details: name, email, credentials, experience, specialty, fees, and address.
* **Doctors Directory List**:
  * Displays a grid of all registered doctors.
  * Includes a **live toggle switch** to change doctor availability. Toggling a doctor off instantly hides them from the patient booking portal.

### D. System-Wide Appointments List
* **Central Log**:
  * Displays every appointment booked in the system, showing patient name, doctor name, date, time, and fee.
* **Override Cancellation**:
  * Administrators can cancel any active appointment on behalf of patients or doctors, which releases the booked slot.

### E. Support Ticket Resolution Hub
* **Unified Inbox**:
  * Lists every support ticket submitted by all patients.
* **Ticket Assignment**:
  * Admins can assign a ticket to a specific doctor or support agent by typing their email. This changes the status from `open` to `assigned`.
* **One-Click Resolution**:
  * Admins can write a text response resolving the ticket. Clicking "Resolve" updates the status to `resolved` and pushes the response to the patient's view.

### F. Support Ticket Reports & Analytics
* **Ticket Health Stats**:
  * Renders overall metrics: total tickets, open tickets, assigned tickets, and resolved tickets.
* **Visual Data Charts**:
  * **Status Breakdown**: A circular pie chart showing the percentage of tickets that are open, assigned, or resolved.
  * **Priority Breakdown**: A bar chart displaying the distribution of Low, Medium, and High priority tickets.
  * **Category Distribution**: Lists counts of tickets grouped by categories (e.g., *Payment Issue*, *Appointment Issue*).

---

## 3. 🩺 Doctor Console (Doctor Dashboard)

The doctor portal allows doctors to manage their schedule, track their earnings, and control their profile.

### A. Doctor Authentication
* **Doctor Login**:
  * Doctors log in using their email and the password created during their onboarding.
  * Verifies credentials against the hashed password stored in the database. Returns a `dToken`.

### B. Analytics Dashboard
* **Total Earnings**:
  * Sums up consultation fees from all completed and paid appointments.
* **Total Patients**:
  * Counts the number of unique patients who have booked appointments with the doctor.
* **Total Bookings**:
  * Displays the total number of appointments scheduled.
* **Latest Appointments List**:
  * Shows details of the 5 most recent appointments with options to mark them completed or cancel them.

### C. Appointments Schedule List
* **Appointment Tracker**:
  * Shows all bookings containing patient names, age/dob, slot date, slot time, and action options.
* **Completion Controls**:
  * **Complete**: Clicking marks the appointment as completed (`isCompleted = true`), updating the doctor's earnings.
  * **Cancel**: Clicking cancels the appointment (`cancelled = true`), updating the UI and freeing up the schedule slot.

### D. Doctor Profile Settings
* **Consultation Fees**:
  * Doctors can update their fees (e.g. adjust from $50 to $70).
* **Practice Address**:
  * Edit line 1 and line 2 of their clinic address.
* **Availability Toggle**:
  * Doctors can toggle their own availability on/off.
