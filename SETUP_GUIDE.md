# Donora Project Setup and Run Guide

This guide provides step-by-step instructions to set up and run the Donora blood donation management system locally.

## 1. Prerequisites

### Required Software

- **Python**: 3.9 or higher
- **Node.js**: 14.x or higher (with npm)
- **MySQL**: 5.7 or higher
- **Git**: for cloning the repository
- **Expo CLI**: for React Native development

### Optional Software

- **Docker**: 20.10 or higher (for containerized deployment)
- **Docker Compose**: 1.29 or higher

### Platform-Specific Requirements

#### For Mobile Development
- **Android**: Android Studio with Android Emulator (for Android development)
- **iOS**: Xcode with iOS Simulator (macOS only, for iOS development)
- **Physical Device**: Expo Go app from App Store/Google Play Store

## 2. Project Setup

### Project Structure

```
donora-apie/
├── backend/                 # Python Flask API server
│   ├── app.py              # Main application entry point
│   ├── config.py           # Configuration settings
│   ├── database.py         # Database initialization
│   ├── controllers/        # API route handlers
│   ├── models/            # Database models
│   ├── routes/            # API route definitions
│   ├── schemas/           # Data validation schemas
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── migrations/        # Database migrations and seeds
│   ├── requirements.txt   # Python dependencies
│   ├── .env.example       # Environment variables template
│   ├── Dockerfile         # Docker configuration
│   └── docker-compose.yml # Docker Compose configuration
├── frontend/              # React Native mobile app
│   ├── App.js             # Main application component
│   ├── screens/           # UI screens
│   ├── package.json       # Node.js dependencies
│   ├── app.json          # Expo configuration
│   └── babel.config.js   # Babel configuration
└── docs/                  # Documentation
    ├── API_Testing_Guide.md
    ├── Local_Deployment_Guide.md
    ├── AWS_Deployment_Guide.md
    └── On_Premise_Deployment_Guide.md
```

### Services Overview

- **Backend**: Flask REST API running on port 5000
- **Frontend**: React Native/Expo mobile application
- **Database**: MySQL database named `donora`
- **Authentication**: JWT-based authentication
- **Notifications**: Firebase Cloud Messaging (FCM)

## 3. Virtual Environment

### Create Virtual Environment (Backend)

Navigate to the backend directory and create a Python virtual environment:

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\backend
python -m venv venv
```

### Activate Virtual Environment

#### Windows (PowerShell)
```bash
.\venv\Scripts\Activate.ps1
```

#### Windows (Command Prompt)
```bash
venv\Scripts\activate.bat
```

#### macOS/Linux
```bash
source venv/bin/activate
```

### Deactivate Virtual Environment
```bash
deactivate
```

## 4. Dependency Installation

### Backend Dependencies

With the virtual environment activated, install Python dependencies:

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\backend
pip install -r requirements.txt
```

**Backend Dependencies:**
- Flask==2.0.1
- Flask-SQLAlchemy==2.5.1
- Flask-JWT-Extended==4.4.4
- Flask-Marshmallow==0.14.0
- Gunicorn==20.1.0
- Werkzeug==2.0.3
- marshmallow-sqlalchemy==0.24.2
- PyMySQL==1.0.2
- SQLAlchemy==1.3.24
- python-dotenv (for environment variables)

### Frontend Dependencies

Install Node.js dependencies:

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\frontend
npm install
```

**Frontend Dependencies:**
- expo ~46.0.0
- react 18.0.0
- react-native 0.69.0
- @react-navigation/native ^6.0.0
- @react-navigation/stack ^6.0.0
- axios ^0.27.0
- react-native-paper ^5.0.0
- react-native-gesture-handler ~2.5.0
- react-native-reanimated ~2.9.1
- react-native-safe-area-context ^4.3.1
- react-native-screens ~3.15.0

### Install Expo CLI (Global)

```bash
npm install -g expo-cli
```

## 5. Environment Variables

### Backend Environment Variables

Create a `.env` file in the backend directory:

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\backend
copy .env.example .env
```

Edit the `.env` file with the following variables:

```env
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password

# Security Keys
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_key_here

# Firebase Cloud Messaging (Optional)
FCM_SERVER_KEY=your_fcm_server_key_here
```

**Environment Variable Details:**

| Variable | Purpose | Required | Example Value |
|----------|---------|----------|---------------|
| MYSQL_HOST | MySQL server hostname | Yes | localhost |
| MYSQL_PORT | MySQL server port | Yes | 3306 |
| MYSQL_USER | MySQL username | Yes | root |
| MYSQL_PASSWORD | MySQL password | Yes | your_password |
| SECRET_KEY | Flask secret key for sessions | Yes | random_string_123 |
| JWT_SECRET | JWT token signing secret | Yes | jwt_secret_key_456 |
| FCM_SERVER_KEY | Firebase Cloud Messaging key | No | your_fcm_key |

**Important:** Generate secure random strings for SECRET_KEY and JWT_SECRET. You can generate them using Python:

```python
import secrets
print(secrets.token_hex(32))
```

### Frontend Configuration

The frontend connects to the backend API. Update the API base URL in the frontend screens if needed. Currently, it's configured to connect to `http://192.168.1.13:5000`. You may need to update this to your local machine's IP address or `http://localhost:5000`.

## 6. Database Setup

### MySQL Installation

If you don't have MySQL installed, download and install it from:
- Windows: https://dev.mysql.com/downloads/mysql/
- macOS: `brew install mysql`
- Linux: `sudo apt-get install mysql-server`

### Create Database

Start MySQL service and create the database:

```bash
# Windows (MySQL installed as service)
# Start MySQL from Services or run:
net start MySQL

# Login to MySQL
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE donora;
EXIT;
```

### Update Database Connection

The backend currently has hardcoded database connection in `app.py`. You have two options:

**Option 1: Use environment variables (Recommended)**

Update `backend/app.py` line 19 to use environment variables:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{os.getenv("MYSQL_USER")}:{os.getenv("MYSQL_PASSWORD")}@{os.getenv("MYSQL_HOST")}:{os.getenv("MYSQL_PORT")}/donora'
```

**Option 2: Use hardcoded credentials**

Update line 19 in `backend/app.py` with your MySQL credentials:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:your_password@localhost/donora'
```

### Initialize Database Tables

The application automatically creates tables on startup. However, you can manually initialize them:

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\backend
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

### Seed Database with Initial Data

Run the seed script to populate the database with sample data:

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\backend
python migrations/seed.py
```

This will create:
- 20 sample donors
- 3 sample hospitals
- 5 sample blood banks
- 5 sample transportation services

## 7. Running the Project

### Option A: Manual Setup (Recommended for Development)

#### Step 1: Start MySQL Service

```bash
# Windows
net start MySQL

# macOS/Linux
sudo service mysql start
# or
brew services start mysql  # macOS
```

#### Step 2: Start Backend Server

Open Terminal 1 and run:

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\backend
# Activate virtual environment
.\venv\Scripts\Activate.ps1  # PowerShell
# or
venv\Scripts\activate.bat     # Command Prompt

# Start Flask server
python app.py
```

The backend will start on `http://localhost:5000`

#### Step 3: Start Frontend Development Server

Open Terminal 2 and run:

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\frontend
npm start
```

This will start the Expo development server.

### Option B: Docker Setup (Recommended for Production)

#### Step 1: Build Docker Images

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\backend
docker-compose build
```

#### Step 2: Start Services with Docker

```bash
docker-compose up
```

This will start both the backend API and MySQL database in containers.

### Option C: Docker with Separate Frontend

#### Step 1: Start Backend and Database with Docker

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\backend
docker-compose up
```

#### Step 2: Start Frontend Manually

In a separate terminal:

```bash
cd c:\Users\ASUS TUF\Desktop\APIE_ADV\donora-apie\frontend
npm start
```

## 8. Accessing the Application

### Backend API

- **Health Check**: http://localhost:5000/health
- **API Root**: http://localhost:5000/
- **API Documentation**: See `docs/API_Testing_Guide.md`

### Frontend Mobile App

#### On Physical Device

1. Download Expo Go app from:
   - Android: Google Play Store
   - iOS: App Store
2. Scan the QR code displayed in the terminal
3. The app will load on your device

#### On Android Emulator

- Press `a` in the terminal where Expo is running
- Requires Android Studio and Android Emulator set up

#### On iOS Simulator

- Press `i` in the terminal where Expo is running
- Requires Xcode and iOS Simulator set up (macOS only)

#### On Web Browser

- Press `w` in the terminal where Expo is running
- Opens in your default web browser at http://localhost:19006

### Default Login Credentials

After running the seed script, you can use these sample credentials:

**Donor Accounts:**
- Username: donor0, donor1, ..., donor19
- Password: (check the seed script - currently uses hashed passwords)

**Hospital Accounts:**
- 3 sample hospitals created (Hospital0, Hospital1, Hospital2)

**Blood Bank Accounts:**
- 5 sample blood banks created (BloodBank0, BloodBank1, ..., BloodBank4)

**Transportation Accounts:**
- Username: transport0, transport1, ..., transport4

**Note:** You may need to register a new user through the app's registration screen for full functionality.

## 9. Verification

### Verify Backend is Running

Open a browser or use curl:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running."
}
```

### Verify Database Connection

Check if tables were created:

```bash
mysql -u root -p donora -e "SHOW TABLES;"
```

Expected tables:
- user
- hospital
- blood_bank
- blood_inventory
- blood_request
- donor_response
- transportation_task
- donation_history
- notification

### Verify Frontend is Running

- Check if Expo development server is running (look for QR code in terminal)
- Try accessing http://localhost:19006 in a browser
- Check if you can scan the QR code with Expo Go app

### Test API Endpoints

Use Postman or curl to test API endpoints. Import the Postman collection from `docs/Postman_Collection.json`.

Example test:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test registration (adjust data as needed)
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass","role":"DONOR"}'
```

## 10. Troubleshooting

### Backend Issues

**Issue: "ModuleNotFoundError: No module named 'flask'"**
- Solution: Ensure virtual environment is activated and dependencies are installed
- Run: `pip install -r requirements.txt`

**Issue: "Can't connect to MySQL server"**
- Solution: 
  - Verify MySQL service is running
  - Check MySQL credentials in `.env` file
  - Ensure database `donora` exists
  - Check if MySQL is listening on port 3306

**Issue: "Access denied for user"**
- Solution: Update MYSQL_USER and MYSQL_PASSWORD in `.env` file with correct credentials

**Issue: Port 5000 already in use**
- Solution: 
  - Kill the process using port 5000: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
  - Or change the port in `app.py` line 47

**Issue: "SQLAlchemy error"**
- Solution: Ensure database tables are created by running the seed script or manually creating tables

### Frontend Issues

**Issue: "npm is not recognized"**
- Solution: Install Node.js from https://nodejs.org/ and restart terminal

**Issue: "expo is not recognized"**
- Solution: Run `npm install -g expo-cli`

**Issue: "Metro bundler failed to start"**
- Solution: 
  - Clear cache: `npm start -- --clear`
  - Delete node_modules and reinstall: `rmdir /s node_modules` then `npm install`

**Issue: "Unable to connect to backend"**
- Solution:
  - Ensure backend is running on port 5000
  - Check if IP address in frontend screens matches your backend IP
  - If using physical device, ensure device and computer are on same network
  - Try using your machine's local IP instead of localhost

**Issue: "Network request failed"**
- Solution:
  - Check if backend CORS is enabled (it is in app.py)
  - Verify backend is accessible from frontend
  - Check firewall settings

### Database Issues

**Issue: MySQL service won't start**
- Solution:
  - Check MySQL error logs
  - Ensure no other MySQL instance is running
  - Reinstall MySQL if necessary

**Issue: "Database donora doesn't exist"**
- Solution: Create the database manually:
  ```sql
  CREATE DATABASE donora;
  ```

**Issue: "Table doesn't exist"**
- Solution: Run the seed script or manually create tables:
  ```bash
  python migrations/seed.py
  ```

### Docker Issues

**Issue: "docker-compose command not found"**
- Solution: Install Docker Desktop from https://www.docker.com/products/docker-desktop

**Issue: "Port 3306 already in use"**
- Solution: Stop existing MySQL service or change port in docker-compose.yml

**Issue: "Container fails to start"**
- Solution:
  - Check logs: `docker-compose logs`
  - Ensure .env file exists with correct values
  - Rebuild images: `docker-compose build --no-cache`

### General Issues

**Issue: Python version incompatibility**
- Solution: Ensure Python 3.9+ is installed. Check version: `python --version`

**Issue: Virtual environment activation fails**
- Solution:
  - PowerShell: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
  - Recreate virtual environment: delete venv folder and run `python -m venv venv`

**Issue: CORS errors in browser**
- Solution: CORS is already enabled in app.py. If still issues, check browser console for specific errors

## Additional Resources

- **API Documentation**: `docs/API_Testing_Guide.md`
- **Deployment Guides**: 
  - `docs/Local_Deployment_Guide.md`
  - `docs/AWS_Deployment_Guide.md`
  - `docs/On_Premise_Deployment_Guide.md`
- **Postman Collection**: `docs/Postman_Collection.json`

## Support

For issues not covered in this guide:
1. Check the existing documentation in the `docs/` folder
2. Review the code comments in the source files
3. Check the GitHub repository issues (if available)
4. Verify all prerequisites are correctly installed

## Quick Start Summary

For experienced developers, here's the quick start:

```bash
# 1. Setup Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your MySQL credentials
mysql -u root -p -e "CREATE DATABASE donora;"
python migrations/seed.py
python app.py

# 2. Setup Frontend (in new terminal)
cd frontend
npm install
npm start

# 3. Access
# Backend: http://localhost:5000
# Frontend: Scan QR code with Expo Go app
```

---

**Note**: This guide assumes you're running on Windows based on the file paths. Adjust commands accordingly for macOS or Linux.
