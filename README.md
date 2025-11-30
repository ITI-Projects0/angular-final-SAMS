# SAMS - Frontend (Angular)

## Overview
This is the frontend application for the Student Attendance Management System (SAMS), built with **Angular 18+**. It features a modern, responsive design with a robust authentication system and dynamic role-based dashboards.

## 🚀 Key Features

### Authentication & Security
- **Secure Auth Flow**: JWT-based authentication with `HttpInterceptor` to attach tokens automatically.
- **Google Login**: Implements **Secure Exchange Token** flow to safely authenticate with the backend.
- **Guards**: 
  - `AuthGuard`: Protects private routes.
  - `GuestGuard`: Prevents logged-in users from accessing login/register pages.
  - `RoleGuard`: Restricts access based on user roles (Admin vs Staff vs Student).
- **Auto-Logout**: Handles 401 Unauthorized errors by clearing session and redirecting to login.

### Architecture
- **Standalone Components**: Modern Angular architecture without NgModules.
- **Layouts**:
  - `AuthLayout`: For login, register, and reset password pages.
  - `MainLayout`: For dashboard and internal pages (Sidebar, Navbar).
  - `PublicLayout`: For landing pages.
- **Services**: Centralized `AuthService`, `ApiService`, and `TokenStorageService`.

### UI/UX
- **Responsive Design**: Mobile-first approach.
- **Dark Mode**: Built-in theme switcher with persistence.
- **Feedback**: Toast notifications and loading indicators.

## 🛠️ Tech Stack
- **Framework**: Angular 18+
- **Styling**: Vanilla CSS (with custom design system variables).
- **State Management**: RxJS (Signals for some UI states).
- **Routing**: Angular Router with lazy loading.

## ⚙️ Setup & Installation

1. **Navigate to the directory**
   ```bash
   cd angular-final-SAMS
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm start
   ```
   The app will typically run on `http://localhost:4200` (or `http://localhost:35045` if configured).

## 📂 Project Structure

```
src/app/
├── core/               # Singleton services, guards, interceptors, models
│   ├── auth/           # Auth logic (Service, Guards, TokenStorage)
│   ├── interceptors/   # HTTP Interceptors
│   ├── models/         # TypeScript Interfaces (User, etc.)
│   └── services/       # Global services (Api, Theme, Loading)
├── features/           # Feature modules (Pages)
│   ├── admin/          # Admin Dashboard & Routes
│   ├── auth/           # Login, Register, Reset Password components
│   ├── public/         # Home, Landing pages
│   └── staff-dashboard/# Staff/Teacher Dashboard
├── layouts/            # Layout components (Auth, Main, Public)
└── shared/             # Reusable UI components
```

## 🔗 Backend Integration
This frontend is configured to talk to the Laravel backend at `http://localhost:8000/api`.
Ensure the backend is running and CORS is configured correctly.
