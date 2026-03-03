# 💻 ClassSphere / SAMS – Angular Frontend

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Pusher](https://img.shields.io/badge/Realtime-Pusher%20%2F%20Laravel%20Echo-4B32C3?style=for-the-badge&logo=pusher&logoColor=white)

### Live & Backend Links
- Frontend (Netlify): https://classsphere-sams.netlify.app  
- API Base: http://localhost:8000/api  
- Backend Repo (Laravel): https://github.com/ITI-Projects0/laravel-final-SAMS  

---

## Overview
ClassSphere is a full SPA for the **Student Attendance Management System (SAMS)**. It ships role-specific dashboards (Admin, Center Admin/Teacher, Student, Parent), real-time notifications, AI copilots, and a modern Tailwind-powered UI built entirely with Angular standalone components.

---

## Features
- **Authentication & Access**: Email/password, token exchange (e.g., Google flow), email verification, password reset, approval gates, guest/auth/role guards, and HTTP interceptors for auth/error/loading.
- **Dashboards**:
  - *Admin*: Centers approval, courses, staff/students/parents directories, payments, contacts, settings.
  - *Staff (center_admin/teacher/assistant)*: Groups, lessons/assessments, attendance taking, students & staff management, unified dashboard shell.
  - *Student*: Classes, attendance, assignments, video viewer, profile.
  - *Parent*: Children overview, attendance/grade insights, child class details, profile.
- **AI Assistants**: AI chat widget, student AI lab (quiz/study plan/summaries), parent/center AI insights and forecasts, powered by `/api/ai` endpoints.
- **Real-Time & Notifications**: Pusher + Laravel Echo private channels, polling fallback, toast notifications via `ngx-toastr`, unread counters.
- **UI/UX**: Tailwind CSS + Flowbite components, glassmorphism cards, responsive layouts, charts with Chart.js, global loader with minimum display time, modal/toast hosts.

---

## Tech Stack
| Category | Technology |
|----------|------------|
| Framework | Angular 21 (standalone components) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4.1, Flowbite, FontAwesome |
| State/Signals | RxJS 7.8, Angular signals |
| Real-Time | Laravel Echo, Pusher JS |
| Charts | Chart.js 4.5 |
| Tooling | Angular CLI, npm 10 |

---

## Project Structure (key paths)
- `src/app/core`: auth services/guards (`auth.guard.ts`, `role.guard.ts`, `approval.guard.ts`), interceptors (`auth.interceptor.ts`, `error.interceptor.ts`, `loader.interceptor.ts`), models, utilities, API/AI/notification services.
- `src/app/layouts`: public, auth, unified-dashboard (admin/staff), student dashboard shells.
- `src/app/features`: public pages, auth flows, admin pages, staff dashboard, student pages, parent pages, AI widgets/panels, 404.
- `src/app/shared`: reusable UI (cards, tables, modals, loaders, toasts, outlet router host).
- `netlify.toml`: build command and SPA redirects; publishes `dist/final-angular-SAMS/browser`.

---

## Configuration
- **API base URL**: Update `baseOrigin` in `src/app/core/services/api.service.ts` if the backend host changes. All REST calls use `${baseOrigin}/api`.
- **AI endpoints**: `src/app/core/services/ai.service.ts` targets `http://localhost:8000/api/ai`; point this to your AI gateway if different.
- **Real-time**: `src/app/core/services/notification.service.ts` sets the Pusher key (`f3a80187efd8663a3273`) and auth endpoints. Align these with your Laravel broadcasting config.
- **Branding**: `src/app/core/config/app.config.ts` and `src/app/core/config/brand.ts` centralize product name/tagline/colors.
- **Styling**: Tailwind/Flowbite scan `src/**/*.{html,ts}` via `tailwind.config.js`; global styles live in `src/styles.css` and component-level styles in standalone components.

---

## Getting Started
1. **Prerequisites**: Node 18+ (Node 20 recommended), npm 10.x.
2. **Install dependencies**
   ```bash
   cd final-angular-SAMS
   npm install
   ```
3. **Run locally**
   ```bash
   npm start
   # serves at http://localhost:4200
   ```
4. **Build for production**
   ```bash
   npm run build
   # output: dist/final-angular-SAMS/browser
   ```
5. **Tests** (if present)
   ```bash
   npm test
   ```

---

## Deployment
- Netlify uses the provided `netlify.toml` (`npm run build`, publish `dist/final-angular-SAMS/browser`, SPA redirect `/* -> /index.html`).
- Ensure the deployed frontend points to the correct backend host and broadcasting credentials (API/AI services + Pusher config above).

---

## Backend Pairing
- Laravel API: http://localhost:8000/api  
- Source: https://github.com/ITI-Projects0/laravel-final-SAMS  
Ensure CORS/broadcasting settings in the backend allow the frontend origin used in development and production.

---

## License

- **Real-Time**: Configure Pusher credentials in `src/environments/environment.ts` to match the backend.

---

## 📄 License
This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
