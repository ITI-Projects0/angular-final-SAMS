# 💻 SAMS - Frontend (Angular)

![Angular](https://img.shields.io/badge/Angular-18%2B-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)

## 🌟 Overview

This is the modern, responsive frontend for the **Student Attendance Management System (SAMS)**. Built with **Angular 18+**, it delivers a seamless Single Page Application (SPA) experience with dynamic dashboards, real-time updates, and an intuitive design system.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure HTTP interceptors automatically handle token attachment and refresh.
- **Secure Google Login**: Implements a secure exchange token flow to prevent token leakage.
- **Role-Based Routing**:
  - `AuthGuard`: Protects private routes.
  - `RoleGuard`: Ensures users only access dashboards authorized for their role (Admin, Staff, Student, Parent).
- **Auto-Logout**: Session management handles token expiration gracefully.

### 🎨 UI/UX & Design
- **Modern Architecture**: Fully **Standalone Components** (No NgModules).
- **Responsive Design**: Mobile-first layout using **Tailwind CSS**.
- **Dark Mode**: System-aware dark mode with manual toggle and persistence.
- **Glassmorphism**: Premium UI aesthetic with glass-effect cards and panels.
- **Interactive Feedback**: Toast notifications (`ngx-toastr`) and skeleton loaders.

### 📊 Dynamic Dashboards

#### 👨‍💼 Admin Dashboard
- **Center Approvals**: Review and approve pending center applications.
- **System Stats**: Visual analytics of system-wide usage.
- **User Management**: Full CRUD for system users.

#### 🏫 Staff Dashboard (Center Admin/Teacher)
- **Class Management**: Create groups, schedule lessons, and manage resources.
- **Attendance**: Interactive lesson-based attendance taking.
- **Student Management**: Add students to groups, view profiles, and contact parents.

#### 🎓 Student Dashboard
- **My Learning**: View enrolled courses, upcoming lessons, and assignments.
- **AI Lab**: Access AI quiz generator and study planner.
- **Grades**: Track assessment scores and feedback.

#### 👨‍👩‍👧 Parent Dashboard
- **Child Overview**: Monitor attendance rates and academic progress.
- **AI Summaries**: View weekly AI-generated performance reports.
- **Notifications**: Real-time alerts for absence or low grades.

### 🤖 AI Integration
- **Chat Widget**: Floating AI assistant available across the platform.
- **Insights Components**: Visual AI analytics cards.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Angular 18+ |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, Flowbite, FontAwesome |
| **State Management** | RxJS (Observables & Signals) |
| **Real-Time** | Pusher JS, Laravel Echo |
| **Charts** | Chart.js |
| **Build Tool** | Angular CLI (Vite-based) |

---

## ⚙️ Setup & Installation

1. **Navigate to the directory**
   ```bash
   cd angular-final-SAMS
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configuration**
   Ensure the backend API URL is correctly set in `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://classsphere.app.mrbotusa.com/api'
   };
   ```

4. **Run Development Server**
   ```bash
   npm start
   ```
   The app will run on `http://localhost:4200`.

---

## 📂 Project Structure

```
src/app/
├── core/               # Singleton services, guards, interceptors, models
│   ├── auth/           # Auth logic (Service, Guards, TokenStorage)
│   ├── interceptors/   # HTTP Interceptors (Token, Error handling)
│   ├── models/         # TypeScript Interfaces (User, Group, Lesson)
│   └── services/       # Global services (Api, Theme, Notification)
├── features/           # Feature modules (Lazy Loaded Pages)
│   ├── admin/          # Super Admin Dashboard
│   ├── auth/           # Login, Register, Reset Password
│   ├── staff-dashboard/# Center Admin & Teacher Interface
│   ├── student-pages/  # Student Interface
│   ├── parent-pages/   # Parent Interface
│   └── public/         # Landing pages
├── layouts/            # Layout components (Auth, Main, Public)
└── shared/             # Reusable UI components (Cards, Tables, Modals)
```

---

## 🔗 Backend Integration
This frontend is designed to consume the **Laravel SAMS API**.
- **CORS**: Ensure the Laravel backend allows requests from `http://localhost:4200`.
- **Real-Time**: Configure Pusher credentials in `src/environments/environment.ts` to match the backend.

---

## 📄 License
This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
