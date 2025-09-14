# ابوحذيفة للصرافة والتحويلات

## Project Setup
This monorepo contains both the backend and frontend for the application.

### Backend
- **Tech Stack:** Node.js, Express, PostgreSQL, JWT
- **Features:**
  - Authentication (login/register)
  - CRUD for Delegates and Clients
  - Collection Management
- **Run the server:**
  ```bash
  cd backend
  npm install
  npm start
  ```

### Frontend
- **Tech Stack:** React.js, Tailwind CSS
- **Features:**
  - RTL support for Arabic
  - Admin Dashboard
- **Run the frontend:**
  ```bash
  cd frontend
  npm install
  npm start
  ```

### Project Structure
- **backend/**
  - Contains all backend-related code including models, controllers, and routes.
- **frontend/**
  - Contains all frontend-related code including components and styles.
