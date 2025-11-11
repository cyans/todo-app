# 📝 To-Do List Web Application

[![GitHub](https://img.shields.io/badge/GitHub-cyans-blue?logo=github)](https://github.com/cyans/todo-app)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TAG System](https://img.shields.io/badge/TAG-MoAI--ADK-blue)](#-tag-system)

Modern full-stack To-Do List application with React frontend and Express backend, featuring real-time collaboration and advanced UI/UX.

## 🚀 Project Status

**Current Phase:** Phase 3 - Task CRUD Implementation (TAG: TASK-CRUD-003)
**Progress:** ✅ ✅ Complete - All Todo Components Implemented
**Latest Release:** v1.0.0 (2025-11-11)

## 📂 Project Structure

```
todo/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── services/      # API Services
│   │   ├── utils/         # Utility Functions
│   │   └── styles/       # CSS Styles
├── backend/           # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── controllers/   # Business Logic
│   │   ├── models/        # Database Models
│   │   └── routes/        # API Routes
├── .moai/             # MoAI-ADK Configuration
│   └── specs/          # Specifications with TAG System
├── docs/              # Documentation
├── tests/             # Test Files
├── Implementation_Plan.md     # Detailed implementation roadmap
└── To-Do List 웹앱 스팩.md    # Project specification (Korean)
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

- [x] ✅ **Phase 1:** Project Setup (SETUP-ENV-001) - 3-4 days (Complete)
- [ ] **Phase 2:** Authentication System (AUTH-SYSTEM-002) - 5-6 days (Planned)
- [x] ✅ **Phase 3:** Task CRUD (TASK-CRUD-003) - 7-8 days (Complete)
- [x] ✅ **Phase 4:** Filter/Search/Sort (FILTER-SEARCH-004) - 4-5 days (Complete)
- [ ] **Phase 5:** UI/UX & Deployment (UI-UX-DEPLOY-005) - 5-6 days (Planned)
- [ ] **Phase 6:** Testing & Optimization (TEST-OPTIMIZE-006) - 3-4 days (Planned)

See `Implementation_Plan.md` for detailed breakdown.

## 🎯 Features

### ✅ Implemented Features

#### Core Todo Management
- ✅ **Todo CRUD Operations** - Create, Read, Update, Delete tasks
- ✅ **Priority Levels** - High, Medium, Low priority with visual indicators
- ✅ **Due Dates** - Task deadlines with calendar integration
- ✅ **Task Descriptions** - Detailed task descriptions support
- ✅ **Status Management** - Complete/Incomplete task tracking

#### Advanced UI/UX
- ✅ **Modern Design** - Clean, responsive interface with animations
- ✅ **Dark Mode** - Full dark theme support with smooth transitions
- ✅ **Progress Visualization** - Real-time progress tracking with animated indicators
- ✅ **Filtering & Sorting** - Advanced task filtering and sorting capabilities
- ✅ **Responsive Design** - Mobile-first approach with breakpoint optimization

#### User Experience
- ✅ **Empty States** - Helpful empty state guidance
- ✅ **Error Handling** - Graceful error states with retry functionality
- ✅ **Loading States** - Smooth loading animations
- ✅ **Keyboard Navigation** - Full accessibility with keyboard support
- ✅ **Accessibility (A11y)** - WCAG compliant with ARIA labels

#### Performance & Quality
- ✅ **Optimized Re-renders** - Efficient React component updates
- ✅ **Animation System** - CSS animations for smooth transitions
- ✅ **State Management** - Centralized state with React hooks
- ✅ **Component Architecture** - Modular, reusable components

### 🔄 Planned Features (Next Phase)

#### Authentication
- 🔐 **User Authentication** - Email + Social login (Phase 2)
- 🔐 **User Profiles** - Profile management and customization
- 🔐 **Session Management** - Secure session handling

#### Advanced Features
- 📱 **Real-time Sync** - Socket.io for live updates (Phase 5)
- 🤝 **Collaboration** - Multi-user task sharing (Phase 5)
- 🤖 **AI Auto-categorization** - Smart task categorization (Phase 6)
- 📅 **Calendar Integration** - Google Calendar sync (Phase 5)

#### Enhanced UI/UX
- 🎨 **Custom Themes** - User customizable color schemes (Phase 5)
- 📊 **Analytics Dashboard** - Productivity insights (Phase 6)
- 🔔 **Smart Notifications** - Intelligent task reminders (Phase 6)

## 📖 Documentation

### Core Documentation
- [Implementation Plan](./Implementation_Plan.md) - Detailed 6-phase development plan
- [Project Specification](./To-Do%20List%20웹앱%20스팩.md) - Original requirements (Korean)
- [Frontend README](./frontend/README.md) - Frontend-specific documentation
- [Backend API Docs](./backend/README.md) - API endpoints documentation

### Component Documentation
- [Todo Components Guide](./docs/components/Todo-Components.md) - Complete component documentation (Korean)
- [Component Architecture](./docs/ARCHITECTURE.md) - Technical architecture overview

### MoAI-ADK Documentation
- [SPEC Files](./.moai/specs/) - Detailed specifications with TAG system
- [Configuration](./.moai/config.json) - MoAI-ADK agent configuration
- [Agent Guide](./CLAUDE.md) - Alfred agent documentation

---

## 🏷️ TAG System

The project follows the MoAI-ADK TAG system for complete traceability:

### TAG Categories
- **@SPEC** - Requirements specifications
- **@CODE** - Implementation code
- **@TEST** - Test cases
- **@DOC** - Documentation

### Current TAG Inventory
| Component | SPEC | CODE | TEST | DOC | Status |
|-----------|------|------|------|-----|---------|
| Main App | ✅ @SPEC:TODO-MAIN-001 | ✅ @CODE:TODO-MAIN-001 | ❌ @TEST | ❌ @DOC | Complete |
| Todo Form | ✅ @SPEC:TODO-FORM-001 | ✅ @CODE:TODO-FORM-001 | ❌ @TEST | ❌ @DOC | Complete |
| Todo List | ✅ @SPEC:TODO-LIST-001 | ✅ @CODE:TODO-LIST-001 | ❌ @TEST | ❌ @DOC | Complete |
| Todo Item | ✅ @SPEC:TODO-ITEM-001 | ✅ @CODE:TODO-ITEM-001 | ❌ @TEST | ❌ @DOC | Complete |
| Todo Filter | ✅ @SPEC:TODO-FILTER-001 | ✅ @CODE:TODO-FILTER-001 | ❌ @TEST | ❌ @DOC | Complete |
| MCP Proxy | ✅ @SPEC:MCP-001 | ✅ @CODE:MCP-001 | ✅ @TEST:MCP-001 | ❌ @DOC | In Progress |

### TAG Chain Integrity
- **Complete Chains**: 1/6 (17%)
- **Orphan TAGs**: 0 (All @CODE TAGs have @SPEC)
- **Broken Links**: 0

### TAG Rules
- Every @CODE must have matching @SPEC
- Every @TEST must have matching @SPEC
- Documentation must reference @TAG identifiers
- All TAGs follow MoAI-ADK naming conventions

### TAG Validation
Run tag validation with:
```bash
# TAG integrity check
Skill("moai-foundation-tags")
```

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
