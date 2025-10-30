# 📝 To-Do List Web Application

[![GitHub](https://img.shields.io/badge/GitHub-cyans-blue?logo=github)](https://github.com/cyans/todo-app)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Full-stack To-Do List application with React frontend and Express backend.

## 🚀 Project Status

**Current Phase:** Phase 1 - Project Setup (TAG: SETUP-ENV-001)
**Progress:** ✅ Initial Setup Complete

## 📂 Project Structure

```
todo/
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # Node.js + Express + MongoDB
├── Implementation_Plan.md   # Detailed implementation roadmap
└── To-Do List 웹앱 스팩.md  # Project specification (Korean)
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.x
- **Build Tool:** Vite 6.x
- **Styling:** TailwindCSS 3.4.x
- **State Management:** Zustand 4.5.x
- **HTTP Client:** Axios 1.6.x
- **Routing:** React Router 6.22.x
- **Form Handling:** React Hook Form 7.51.x

### Backend
- **Runtime:** Node.js 20.x LTS
- **Framework:** Express 5.x
- **Database:** MongoDB 7.0.x
- **ODM:** Mongoose 8.2.x
- **Authentication:** JWT + bcrypt
- **Validation:** Joi 18.x
- **Security:** Helmet, CORS

## 🏁 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or yarn 1.22.x
- MongoDB (local or Atlas)
- Git

### Clone Repository

```bash
git clone https://github.com/cyans/todo-app.git
cd todo-app
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

Frontend will run on http://localhost:5173

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Backend will run on http://localhost:5000

## 📋 Implementation Phases

- [x] **Phase 1:** Project Setup (SETUP-ENV-001) - 3-4 days
- [ ] **Phase 2:** Authentication System (AUTH-SYSTEM-002) - 5-6 days
- [ ] **Phase 3:** Task CRUD (TASK-CRUD-003) - 7-8 days
- [ ] **Phase 4:** Filter/Search/Sort (FILTER-SEARCH-004) - 4-5 days
- [ ] **Phase 5:** UI/UX & Deployment (UI-UX-DEPLOY-005) - 5-6 days
- [ ] **Phase 6:** Testing & Optimization (TEST-OPTIMIZE-006) - 3-4 days

See `Implementation_Plan.md` for detailed breakdown.

## 🎯 Features

### Core Features
- ✅ User Authentication (Email + Social Login)
- ✅ Task CRUD Operations
- ✅ Categories and Tags
- ✅ Search and Filtering
- ✅ Priority Levels
- ✅ Due Dates
- ✅ Dark Mode
- ✅ Responsive Design

### Future Extensions (Post-MVP)
- 📱 Real-time Sync (Socket.io)
- 🤝 Collaboration Features
- 🤖 AI Auto-categorization
- 📅 Calendar Integration

## 📖 Documentation

- [Implementation Plan](./Implementation_Plan.md) - Detailed 6-phase development plan
- [Project Specification](./To-Do%20List%20웹앱%20스팩.md) - Original requirements (Korean)
- [Frontend README](./frontend/README.md) - Frontend-specific documentation
- [Backend API Docs](./backend/README.md) - API endpoints documentation

## 🤝 Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches (e.g., `feature/auth-system-002`)

### Commit Convention
```
[TAG] type: description

TAG: PHASE-FEATURE-NUMBER
```

Example:
```
[SETUP-ENV-001] feat: initialize frontend with Vite and TailwindCSS

TAG: SETUP-ENV-001
```

## 📝 License

MIT

## 👤 Author

**cyans** - [GitHub](https://github.com/cyans)

*Built with MoAI-ADK Alfred Agent*

---

**Last Updated:** 2025-10-30
**Version:** 1.0.0 (Phase 1)
