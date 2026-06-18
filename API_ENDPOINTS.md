# 🔌 API Endpoints Reference

This document lists all available API endpoints in the **Doctor Appointment & Support Ticket System**. You can use these endpoints to configure your API client (e.g. Postman or Insomnia).

## 🌐 Base Server URLs
* **Local Development**: `http://localhost:4000`
* **Production Live Server**: `https://prescriptobackendload.vercel.app`

---

## 🧑‍🤝‍🧑 Patient (User) Endpoints

### 1. Register User
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/user/register`
* **Description**: Register a new patient account.
* **Request Body (JSON)**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```

### 2. Login User
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/user/login`
* **Description**: Log in as a patient to receive a JWT authentication token.
* **Request Body (JSON)**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```

### 3. Get User Profile
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/user/get-profile`
* **Description**: Retrieve the profile details of the currently authenticated patient.
* **Headers**: 
  * `Authorization: Bearer <user_token>`

### 4. Update User Profile
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/user/update-profile`
* **Description**: Update the logged-in patient's profile details.
* **Headers**: 
  * `Authorization: Bearer <user_token>`
* **Request Body (Form Data)**:
  * `name`: Jane Doe (text)
  * `phone`: 9876543210 (text)
  * `dob`: 1995-12-01 (text)
  * `gender`: Female (text)
  * `address`: `{"line1": "123 Main St", "line2": "Apt 4B"}` (text)
  * `image`: `avatar.png` (file, optional)

### 5. Book Appointment
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/user/book-appointment`
* **Description**: Book an appointment with a doctor for a specific date and time.
* **Headers**: 
  * `Authorization: Bearer <user_token>`
* **Request Body (JSON)**:
  ```json
  {
    "docId": "1",
    "slotDate": "18_6_2026",
    "slotTime": "10:30 am"
  }
  ```

### 6. List User Appointments
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/user/appointment`
* **Description**: Get all appointments booked by the authenticated patient.
* **Headers**: 
  * `Authorization: Bearer <user_token>`

### 7. Cancel Appointment
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/user/cancel-appointment`
* **Description**: Cancel an upcoming appointment, releasing the doctor's slot.
* **Headers**: 
  * `Authorization: Bearer <user_token>`
* **Request Body (JSON)**:
  ```json
  {
    "appointmentId": "12"
  }
  ```

---

## 🩺 Doctor Endpoints

### 1. List Available Doctors
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/doctor/list`
* **Description**: Retrieve all registered doctors who are currently marked as available.
* **Request Body**: None (Public Endpoint)

### 2. Login Doctor
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/doctor/login`
* **Description**: Authenticate as a doctor to receive a doctor JWT token.
* **Request Body (JSON)**:
  ```json
  {
    "email": "doctor@example.com",
    "password": "securepassword123"
  }
  ```

### 3. List Doctor Appointments
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/doctor/appointments`
* **Description**: Retrieve all appointments scheduled with the authenticated doctor.
* **Headers**: 
  * `Authorization: Bearer <doctor_token>`

### 4. Complete Appointment
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/doctor/complete-appoiappointment`
* **Description**: Mark an appointment as completed.
* **Headers**: 
  * `Authorization: Bearer <doctor_token>`
* **Request Body (JSON)**:
  ```json
  {
    "appointmentId": "12"
  }
  ```

### 5. Cancel Appointment
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/doctor/cancel-appoiappointment`
* **Description**: Cancel an appointment from the doctor's side.
* **Headers**: 
  * `Authorization: Bearer <doctor_token>`
* **Request Body (JSON)**:
  ```json
  {
    "appointmentId": "12"
  }
  ```

### 6. Get Doctor Dashboard Analytics
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/doctor/dashboard`
* **Description**: Retrieve earnings, total patients, total appointments, and 5 latest bookings.
* **Headers**: 
  * `Authorization: Bearer <doctor_token>`

### 7. Get Doctor Profile
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/doctor/profile`
* **Description**: Retrieve profile information for the authenticated doctor.
* **Headers**: 
  * `Authorization: Bearer <doctor_token>`

### 8. Update Doctor Profile
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/doctor/update-profile`
* **Description**: Update consultation fees, clinic address, and availability status.
* **Headers**: 
  * `Authorization: Bearer <doctor_token>`
* **Request Body (JSON)**:
  ```json
  {
    "fee": 150,
    "address": {
      "line1": "Medical Square Suite 1",
      "line2": "Downtown Crossroad"
    },
    "available": true
  }
  ```

---

## 👑 Admin Endpoints

### 1. Login Admin
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/admin/login`
* **Description**: Log in as administrator using root environment credentials.
* **Request Body (JSON)**:
  ```json
  {
    "email": "admin@prescripto.com",
    "password": "adminpassword"
  }
  ```

### 2. Add New Doctor
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/admin/add-doctor`
* **Description**: Register and onboard a new doctor profile.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`
* **Request Body (Form Data)**:
  * `name`: Dr. James Smith (text)
  * `email`: james@example.com (text)
  * `password`: doctorpass123 (text)
  * `speciality`: General physician (text)
  * `degree`: MBBS, MD (text)
  * `experience`: 5 Years (text)
  * `about`: Experienced doctor specializing in internal medicine. (text)
  * `fee`: 100 (text)
  * `address`: `{"line1": "Green Road", "line2": "Apt 2A"}` (text)
  * `image`: `doctor_photo.jpg` (file)

### 3. List All Doctors (Include Unavailable)
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/admin/all-doctors`
* **Description**: Retrieve list of all doctors including those currently inactive.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`

### 4. Toggle Doctor Availability
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/admin/change-availability`
* **Description**: Enable or disable a doctor's profile on the booking portal.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`
* **Request Body (JSON)**:
  ```json
  {
    "docId": "1"
  }
  ```

### 5. Get System Appointments
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/admin/appointments`
* **Description**: Retrieve all bookings scheduled across the system.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`

### 6. Cancel System Appointment
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/admin/cancel-appointment`
* **Description**: Force-cancel any appointment.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`
* **Request Body (JSON)**:
  ```json
  {
    "appointmentId": "12"
  }
  ```

### 7. Get Admin Dashboard Counters
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/admin/dashboard`
* **Description**: Retrieve system-wide stats counters and latest 5 appointments.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`

---

## 🎫 Helpdesk Support Ticket Endpoints

### 1. Raise Support Ticket (Patient)
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/tickets/create`
* **Description**: Open a support ticket to request help.
* **Headers**: 
  * `Authorization: Bearer <user_token>`
* **Request Body (JSON)**:
  ```json
  {
    "subject": "Payment was deducted twice",
    "description": "I booked an appointment and my card was charged twice.",
    "category": "Payment Issue",
    "priority": "high"
  }
  ```

### 2. List Patient Tickets (Patient)
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/tickets/list`
* **Description**: Retrieve all support tickets raised by the currently logged-in patient.
* **Headers**: 
  * `Authorization: Bearer <user_token>`

### 3. List All Tickets (Admin)
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/tickets/admin/list`
* **Description**: Retrieve all tickets submitted in the system.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`

### 4. Assign Support Ticket (Admin)
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/tickets/admin/assign`
* **Description**: Assign a support ticket to a doctor or agent by email.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`
* **Request Body (JSON)**:
  ```json
  {
    "ticketId": 3,
    "assignedTo": "doctor@example.com"
  }
  ```

### 5. Resolve Support Ticket (Admin)
* **Endpoint**: `POST https://prescriptobackendload.vercel.app/api/tickets/admin/resolve`
* **Description**: Answer and resolve a support ticket.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`
* **Request Body (JSON)**:
  ```json
  {
    "ticketId": 3,
    "response": "We have reversed the duplicate charge. It should reflect in your account in 3-5 business days."
  }
  ```

### 6. Get Ticket Analytics & Reports (Admin)
* **Endpoint**: `GET https://prescriptobackendload.vercel.app/api/tickets/admin/report`
* **Description**: Retrieve metrics and distributions for status, priority, and categories.
* **Headers**: 
  * `Authorization: Bearer <admin_token>`
