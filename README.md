# 🩸 Donora

# Prerequisites

Please make sure the following software is installed before setting up the project.

- Git
- Node.js (LTS Version)
- npm
- Python 3.x
- Docker Desktop

(Optional)

- MySQL Workbench
- Expo Go (for testing on a physical device)

You can verify your installation by running:

```bash
node -v
npm -v
python --version
docker --version
```

---

# Clone the Repository

```bash
git clone <repository-url>
cd Donora
```

---

# Project Structure

```
Donora/
├── backend/                              # Flask backend application
│   ├── Dockerfile                        # Docker image configuration for the backend
│   ├── app.py                            # Main entry point of the Flask application
│   ├── config.py                         # Application configuration
│   ├── database.py                       # Database connection and initialization
│   ├── docker-compose.yml                # Docker Compose configuration for MySQL
│   ├── requirements.txt                  # Python dependencies
│   ├── controllers/                      # Handles incoming API requests
│   │   ├── auth_controller.py            # User authentication APIs
│   │   ├── blood_bank_controller.py      # Blood bank management APIs
│   │   ├── donor_controller.py           # Donor-related APIs
│   │   ├── hospital_controller.py        # Hospital-related APIs
│   │   ├── matching_controller.py        # Donor matching logic
│   │   ├── notification_controller.py    # Notification APIs
│   │   └── transportation_controller.py  # Transportation management APIs
│   ├── middleware/                       # Middleware components
│   ├── migrations/                       # Database seed and migration scripts
│   ├── models/                           # SQLAlchemy database models
│   │   ├── blood_bank.py
│   │   ├── blood_inventory.py
│   │   ├── blood_request.py
│   │   ├── donation_history.py
│   │   ├── donor_response.py
│   │   ├── hospital.py
│   │   ├── notification.py
│   │   ├── transportation_task.py
│   │   └── user.py
│   ├── routes/                           # API route definitions
│   ├── schemas/                          # Data serialization and validation
│   ├── services/                         # Business logic layer
│   │   ├── matching_service.py           # Matching service implementation
│   │   └── notification_service.py       # Notification service implementation
│   └── utils/                            # Helper and utility functions
│
├── docs/                                 # Project documentation
│   ├── API_Testing_Guide.md              # API testing instructions
│   ├── AWS_Deployment_Guide.md           # AWS deployment guide
│   ├── Final_Project_Documentation.md    # Complete project documentation
│   ├── Local_Deployment_Guide.md         # Local deployment guide
│   ├── On_Premise_Deployment_Guide.md    # On-premise deployment guide
│   └── Postman_Collection.json           # Postman collection for API testing
│
├── frontend/                             # React Native (Expo) mobile application
│   ├── App.js                            # Main application entry point
│   ├── BottomNav.js                      # Bottom tab navigation component
│   ├── README.md                         # Frontend-specific documentation
│   ├── app.json                          # Expo configuration
│   ├── babel.config.js                   # Babel configuration
│   ├── navigation/                       # Navigation configuration
│   │   └── DonorNavigator.js             # Navigation flow for donor users
│   ├── package.json                      # Frontend dependencies and scripts
│   ├── package-lock.json                 # Dependency lock file
│   ├── screens/                          # Application screens
│   │   ├── BloodBankDashboard.js         # Blood bank dashboard
│   │   ├── HospitalDashboard.js          # Hospital dashboard
│   │   ├── InventoryScreen.js            # Blood inventory management
│   │   ├── ProfileScreen.js              # User profile screen
│   │   ├── RequestsScreen.js             # Blood request management
│   │   ├── TransportationDashboard.js   # Transportation dashboard
│   │   ├── auth/                         # Authentication screens
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   └── donor/                        # Donor-specific screens
│   │       ├── DonorDashboard.js
│   │       ├── HistoryScreen.js
│   │       └── NearbyScreen.js
│   └── theme.js                          # Global theme and styling
│
├── package-lock.json                     # Root npm lock file (generated automatically)
├── query/                                # Database queries and SQL resources
└── tree.txt                              # Project directory structure reference
```

---

## Database Diagram

```
                         +------------------+
                         |      users       |
                         +------------------+
                         | id (PK)          |
                         | username         |
                         | password_hash    |
                         | role             |
                         +------------------+
                                  |
                                  |
             (logical ownership by role)
        -------------------+-------------------
        |                                      |
        |                                      |
+------------------+                +------------------+
|    hospitals     |                |   blood_banks    |
+------------------+                +------------------+
| id (PK)          |                | id (PK)          |
| name             |                | name             |
| location         |                | location         |
+------------------+                +------------------+
        |                                      |
        |                                      |
        | 1                                    | 1
        |                                      |
        |                                      |
        | *                                    | *
+----------------------+             +-----------------------+
|   blood_requests     |             |   blood_inventory     |
+----------------------+             +-----------------------+
| id (PK)              |             | id (PK)              |
| hospital_id (FK) ----+------------>|                      |
| blood_type           |             | blood_bank_id (FK) --+
| status               |             | blood_type           |
+----------------------+             | quantity             |
                                     +-----------------------+


                 (future matching process)

+----------------------+
| transportation       |
+----------------------+
| ...                  |
+----------------------+
```

---

## System Architecture

The Donora application follows a client-server architecture, where the mobile application communicates with a RESTful API to manage blood donation services.

```
                           +----------------------+
                           |      End User        |
                           | (Mobile Application) |
                           +----------+-----------+
                                      |
                                      |
                                      v
                     +----------------------------------+
                     |      React Native Frontend       |
                     |----------------------------------|
                     | • Login                          |
                     | • Register                       |
                     | • Role-based Navigation          |
                     | • Dashboard                      |
                     | • Inventory                      |
                     | • Blood Requests                 |
                     | • Profile                        |
                     +----------------+-----------------+
                                      |
                         HTTP Request / JSON + JWT
                                      |
                                      v
                    +-----------------------------------+
                    |         Flask REST API            |
                    |-----------------------------------|
                    | Authentication Controller         |
                    | Hospital Controller               |
                    | Blood Bank Controller             |
                    | Donor Controller                  |
                    | Transportation Controller         |
                    +----------------+------------------+
                                     |
                               SQLAlchemy ORM
                                     |
                                     v
                     +-------------------------------+
                     |         MySQL Database         |
                     |-------------------------------|
                     | Users                         |
                     | Hospitals                     |
                     | Blood Banks                   |
                     | Blood Inventory               |
                     | Blood Requests                |
                     +-------------------------------+
```

---

## Frontend Navigation

After a successful login, users are redirected to a dashboard based on their assigned role.

```
Login
   │
   ▼
Check User Role
   │
   ├──────────────► Donor Dashboard
   │                    │
   │                    ├── Donation History
   │                    ├── Profile
   │                    └── Notifications
   │
   ├──────────────► Hospital Dashboard
   │                    │
   │                    ├── Request Summary
   │                    ├── Create Request
   │                    ├── Requests
   │                    └── Profile
   │
   ├──────────────► Blood Bank Dashboard
   │                    │
   │                    ├── Inventory Summary
   │                    ├── Inventory
   │                    ├── Requests
   │                    └── Profile
   │
   └──────────────► Transportation Dashboard
                        │
                        ├── Delivery Overview
                        ├── Assigned Deliveries
                        └── Profile
```

---

## Request Flow

```
Hospital User
      │
      ▼
Create Blood Request
      │
      ▼
POST /request
      │
      ▼
blood_requests table
      │
      ▼
Blood Bank reviews the request
      │
      ▼
Status Updated
(Pending → Approved → Completed)
```

---

## Inventory Flow

```
Blood Bank User
       │
       ▼
Manage Inventory
(Add / Update / Delete)
       │
       ▼
POST /inventory
PUT /inventory/{id}
DELETE /inventory/{id}
       │
       ▼
blood_inventory table
       │
       ▼
Inventory displayed on Dashboard
```

---

## Authentication Flow

```
User Login
      │
      ▼
POST /login
      │
      ▼
Validate Credentials
      │
      ▼
Generate JWT Token
      │
      ▼
Store Token (AsyncStorage)
      │
      ▼
Access Protected API
```

---

# First-Time Setup

This section only needs to be completed once.

---

## Step 1 — Create a Python Virtual Environment

Create the virtual environment.

### Windows

```bash
python -m venv venv
```

Activate it.

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Step 2 — Install Backend Dependencies

Navigate to the backend directory.

```bash
cd backend
```

After activating the virtual environment:

```bash
pip install -r requirements.txt
```

If `requirements.txt` is unavailable, install the required packages manually.

---

## Step 3 — Install Frontend Dependencies

Open another terminal.

Navigate to the frontend folder.

```bash
cd frontend
```

Install all frontend dependencies.

```bash
npm install
```

This only needs to be done once after cloning the repository.

---

# Running the Project

The project requires **two terminals**.

---

# Terminal 1 — Backend

## 1. Open Docker Desktop

Wait until Docker has completely started.

---

## 2. Navigate to the backend folder

```bash
cd backend
```

---

## 3. Start the MySQL Docker container

```bash
docker compose up -d
```

Verify the container is running.

```bash
docker ps
```

You should see a running MySQL container.

---

## 4. Activate the Python Virtual Environment

Windows

```bash
venv\Scripts\activate
```

macOS / Linux

```bash
source venv/bin/activate
```

---

## 5. Start the Flask Backend

```bash
python app.py
```

The backend server should now be running successfully.

---

# Terminal 2 — Frontend

Navigate to the frontend directory.

```bash
cd frontend
```

Start the Expo development server.

```bash
npx expo start
```

Expo Developer Tools should now open automatically.

You can:

- Press **A** to launch an Android Emulator.
- Scan the QR Code using Expo Go.

---

# Daily Development Workflow

Every time you want to work on the project, follow these steps:

1. Open Docker Desktop.
2. Navigate to the backend folder.

```bash
cd backend
```

3. Start the database.

```bash
docker compose up -d
```

4. Activate the virtual environment.

```bash
venv\Scripts\activate
```

5. Start Flask.

```bash
python app.py
```

6. Open another terminal.

```bash
cd frontend
```

7. Start Expo.

```bash
npx expo start
```

The application is now ready for development.

---

# Stopping the Project

To stop the backend:

```
CTRL + C
```

To stop Expo:

```
CTRL + C
```

To stop Docker:

```bash
docker compose down
```

---

# Common Issues

## Docker Container Not Running

Check the running containers.

```bash
docker ps
```

If the MySQL container is not running:

```bash
docker compose up -d
```

---

## Virtual Environment Not Activated

Windows

```bash
venv\Scripts\activate
```

macOS/Linux

```bash
source venv/bin/activate
```

---

## Missing Python Packages

```bash
pip install -r requirements.txt
```

---

## Missing Frontend Packages

```bash
npm install
```

---

## Expo Cache Issues

```bash
npx expo start --clear
```

---

## Database Connection Error

- Ensure Docker Desktop is running.
- Verify that the MySQL container is active.
- Check that the backend database configuration matches the Docker configuration.

---

# Notes

- Docker **must remain running** while developing.
- The backend **must be started before** launching the frontend.
- The frontend communicates directly with the Flask backend, so both services must be running simultaneously.
- If new frontend dependencies are added, run:

```bash
npm install
```

- If new backend dependencies are added, run:

```bash
pip install -r requirements.txt
```
