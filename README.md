# Doctor Appointment System


## 🚀 Features

- **Multi-role Authentication** (Admin, Doctor, Patient)
- **Appointment Management**
- **Doctor Availability System**
- **Admin Dashboard**
- **Responsive UI**

## 🛠️ Tech Stack

| Frontend              | Backend               |
|-----------------------|-----------------------|
| React                 | Node.js               |
| Tailwind CSS          | Express               |
| React Router          | MongoDB (Mongoose)    |
| Context API           | JWT Authentication    |

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/doctor-appointment-system.git
   cd doctor-appointment-system

2. **Configure Backend**:
    ```
    cd backend
    npm install
    cp .env.example .env  # Update values in .env
4. **Configure Frontend**:
    ```
    cd ../frontend
    npm install
    cp .env.example .env  # Set VITE_BACKEND_URL
5. **Run the System**:
     ```
     # In backend directory:
      npm start
    # In frontend directory (new terminal):
      npm run dev
📂 Directory Structure
```
  doctor-appointment-system/
  ├── backend/
  │   ├── controllers/
  │   ├── middlewares/
  │   ├── models/  
  │   ├── routes/
  │   └── server.js
  │
  ├── frontend/
  │   ├── public/
  │   └── src/
  │       ├── assets/
  │       ├── components/
  │       ├── context/
  │       ├── pages/
  │       └── main.jsx
  ├── admin/
  │   ├── public/
  │   └── src/
  │       ├── assets/
  │       ├── components/
  │       ├── context/
  │       ├── pages/
  │       └── main.jsx
  │
  ├── .gitignore
  └── README.md
