# 📋 To-Do List Web App 구현 계획서

## 프로젝트 메타데이터

* **문서 버전:** 1.1.0
* **작성일:** 2025-10-30 (최종 업데이트: 2025-11-07)
* **작성자:** Implementation Planner Agent
* **프로젝트명:** To-Do List Web Application
* **예상 개발 기간:** 6주 (42일)
* **난이도:** ⭐⭐⭐ (중급)
* **현재 진행도:** Phase 4 완료 (총 7중 4단계 완료)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목표
사용자가 할 일을 효율적으로 관리할 수 있는 직관적이고 반응형 웹 애플리케이션 개발

### 1.2 핵심 가치 제안
* **직관적 UX**: 최소한의 클릭으로 할 일 추가/편집/삭제
* **크로스 플랫폼**: 모바일, 태블릿, PC 모든 환경에서 일관된 경험
* **데이터 지속성**: 로컬 스토리지와 클라우드 동기화 이중 저장
* **확장성**: 향후 팀 협업, AI 기능 추가 가능한 구조

### 1.3 프로젝트 범위

**포함 사항:**
* 사용자 인증 (이메일, 소셜 로그인)
* CRUD 작업 (할 일 생성/읽기/수정/삭제)
* 카테고리화 및 태그 시스템
* 검색 및 필터링
* 반응형 디자인
* 다크 모드

**제외 사항 (향후 확장):**
* 실시간 협업 기능
* AI 자동 분류/추천
* 캘린더 연동
* 모바일 네이티브 앱

---

## 2. 기술 스택 상세 설계

### 2.1 Frontend Stack

| 기술 | 버전 | 선정 이유 | 용도 |
|------|------|-----------|------|
| **React.js** | 18.3.x | - 컴포넌트 재사용성<br>- 풍부한 생태계<br>- Hooks를 통한 상태 관리 단순화 | UI 프레임워크 |
| **TailwindCSS** | 3.4.x | - Utility-first 접근<br>- 빠른 프로토타이핑<br>- 다크 모드 기본 지원 | 스타일링 |
| **Zustand** | 4.5.x | - Redux보다 간단한 API<br>- 번들 크기 최소화 (1KB)<br>- TypeScript 완벽 지원 | 전역 상태 관리 |
| **Axios** | 1.6.x | - Interceptor로 JWT 자동 처리<br>- Request/Response 변환 용이 | HTTP 클라이언트 |
| **React Router** | 6.22.x | - 선언적 라우팅<br>- Code splitting 지원 | 라우팅 |
| **React Hook Form** | 7.51.x | - 성능 최적화된 폼 관리<br>- 번들 크기 최소화 | 폼 검증 |
| **date-fns** | 3.3.x | - Moment.js 대비 경량<br>- Tree-shaking 지원 | 날짜 처리 |

### 2.2 Backend Stack

| 기술 | 버전 | 선정 이유 | 용도 |
|------|------|-----------|------|
| **Node.js** | 20.x LTS | - JavaScript 풀스택 개발<br>- 비동기 I/O 성능 | 런타임 |
| **Express.js** | 4.19.x | - 간단하고 유연한 API<br>- 미들웨어 생태계 풍부 | 웹 프레임워크 |
| **MongoDB** | 7.0.x | - 스키마 유연성<br>- JSON 친화적<br>- Atlas 무료 티어 지원 | 데이터베이스 |
| **Mongoose** | 8.2.x | - 스키마 검증<br>- 미들웨어 지원<br>- 타입 안정성 | ODM |
| **jsonwebtoken** | 9.0.x | - JWT 표준 구현<br>- 간단한 API | 인증 토큰 |
| **bcrypt** | 5.1.x | - 업계 표준 해싱<br>- Salt 자동 생성 | 비밀번호 해싱 |
| **Joi** | 17.12.x | - 강력한 스키마 검증<br>- 명확한 에러 메시지 | 요청 검증 |
| **helmet** | 7.1.x | - 보안 헤더 자동 설정 | 보안 |
| **cors** | 2.8.x | - CORS 정책 관리 | CORS 처리 |

### 2.3 DevOps & Tools

| 기술 | 버전 | 용도 |
|------|------|------|
| **TypeScript** | 5.4.x | 타입 안정성 (선택 사항) |
| **ESLint** | 8.57.x | 코드 품질 관리 |
| **Prettier** | 3.2.x | 코드 포맷팅 |
| **Jest** | 29.7.x | 단위 테스트 |
| **React Testing Library** | 14.2.x | 컴포넌트 테스트 |
| **Supertest** | 6.3.x | API 테스트 |
| **GitHub Actions** | - | CI/CD 자동화 |
| **Vercel** | - | Frontend 배포 |
| **Render** | - | Backend 배포 |

### 2.4 개발 환경 설정

**필수 도구:**
* Node.js 20.x LTS
* npm 10.x 또는 yarn 1.22.x
* MongoDB Compass (로컬 DB 관리)
* Postman (API 테스트)
* Git 2.40+

**권장 VS Code 확장:**
* ESLint
* Prettier
* Tailwind CSS IntelliSense
* MongoDB for VS Code
* Thunder Client (API 테스트)

---

## 3. 프로젝트 구조 설계

### 3.1 Monorepo vs 분리형 선택

**선택: 분리형 저장소** (Frontend/Backend 별도)

**이유:**
* 배포 환경이 다름 (Vercel vs Render)
* 독립적인 버전 관리 가능
* 팀 확장 시 권한 분리 용이
* CI/CD 파이프라인 단순화

### 3.2 Frontend 디렉토리 구조

```
todo-frontend/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── api/                      # API 호출 로직
│   │   ├── authApi.js
│   │   ├── tasksApi.js
│   │   └── axiosInstance.js      # Axios 인스턴스 설정
│   ├── assets/                   # 정적 리소스
│   │   ├── images/
│   │   └── icons/
│   ├── components/               # 재사용 컴포넌트
│   │   ├── common/               # 공통 컴포넌트
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Spinner.jsx
│   │   ├── layout/               # 레이아웃 컴포넌트
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   └── task/                 # 할 일 관련 컴포넌트
│   │       ├── TaskCard.jsx
│   │       ├── TaskForm.jsx
│   │       ├── TaskList.jsx
│   │       └── TaskFilter.jsx
│   ├── hooks/                    # 커스텀 Hooks
│   │   ├── useAuth.js
│   │   ├── useTasks.js
│   │   ├── useLocalStorage.js
│   │   └── useDebounce.js
│   ├── pages/                    # 페이지 컴포넌트
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   └── SettingsPage.jsx
│   ├── store/                    # Zustand 스토어
│   │   ├── authStore.js
│   │   ├── taskStore.js
│   │   └── uiStore.js
│   ├── utils/                    # 유틸리티 함수
│   │   ├── dateFormatter.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── App.jsx
│   ├── index.jsx
│   └── index.css                 # TailwindCSS 설정
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── package.json
├── tailwind.config.js
└── vite.config.js                # Vite 빌드 도구
```

### 3.3 Backend 디렉토리 구조

```
todo-backend/
├── src/
│   ├── config/                   # 설정 파일
│   │   ├── database.js           # MongoDB 연결
│   │   ├── jwt.js                # JWT 설정
│   │   └── env.js                # 환경 변수 관리
│   ├── controllers/              # 비즈니스 로직
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/               # 미들웨어
│   │   ├── authMiddleware.js     # JWT 검증
│   │   ├── errorHandler.js       # 에러 처리
│   │   └── validation.js         # 요청 검증
│   ├── models/                   # Mongoose 모델
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/                   # API 라우트
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── services/                 # 서비스 레이어
│   │   ├── authService.js
│   │   └── taskService.js
│   ├── utils/                    # 유틸리티
│   │   ├── logger.js
│   │   └── apiResponse.js
│   └── app.js                    # Express 앱 설정
├── tests/                        # 테스트
│   ├── unit/
│   │   ├── authService.test.js
│   │   └── taskService.test.js
│   └── integration/
│       ├── auth.test.js
│       └── tasks.test.js
├── .env.example
├── .eslintrc.json
├── package.json
└── server.js                     # 진입점
```

### 3.4 데이터 모델 상세 설계

**User Model (Mongoose Schema):**
```javascript
{
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  provider: { type: String, enum: ['local', 'google', 'kakao'], default: 'local' },
  providerId: { type: String }, // 소셜 로그인 ID
  profileImage: { type: String },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    defaultView: { type: String, enum: ['list', 'grid'], default: 'list' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Task Model (Mongoose Schema):**
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  dueDate: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  tags: [{ type: String, maxlength: 30 }],
  category: { type: String, maxlength: 50 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
- userId: 1, createdAt: -1 (사용자별 최신 할 일 조회)
- userId: 1, isCompleted: 1 (완료 상태별 필터링)
- userId: 1, dueDate: 1 (마감일순 정렬)
```

---

## 4. 단계별 구현 계획

### Phase 1: 프로젝트 초기 설정 (3-4일)

#### TAG: `SETUP-ENV-001`

**목표:** 개발 환경 구축 및 기본 프로젝트 구조 생성

**상세 작업:**

1. **저장소 설정** (0.5일)
   - GitHub 저장소 생성 (frontend, backend 별도)
   - .gitignore 설정 (node_modules, .env, build/)
   - README.md 작성 (프로젝트 개요, 설치 방법)

2. **Frontend 초기화** (1일)
   ```bash
   npm create vite@latest todo-frontend -- --template react
   cd todo-frontend
   npm install tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   npm install zustand axios react-router-dom react-hook-form date-fns
   ```
   - Tailwind 설정 (tailwind.config.js, index.css)
   - 기본 라우팅 구조 생성
   - ESLint, Prettier 설정

3. **Backend 초기화** (1일)
   ```bash
   mkdir todo-backend && cd todo-backend
   npm init -y
   npm install express mongoose jsonwebtoken bcrypt joi helmet cors dotenv
   npm install --save-dev nodemon jest supertest eslint
   ```
   - Express 기본 서버 구조
   - MongoDB Atlas 연결 설정
   - 환경 변수 설정 (.env.example)

4. **개발 도구 설정** (0.5일)
   - VS Code 설정 공유 (.vscode/settings.json)
   - ESLint 규칙 통일
   - Prettier 포맷 통일

5. **Git Workflow 설정** (0.5일)
   - Branch 전략 수립 (main, develop, feature/*)
   - Commit 컨벤션 정의 (Conventional Commits)
   - GitHub Issues 템플릿 작성

**완료 조건:**
- [ ] 로컬에서 frontend `npm run dev` 실행 성공
- [ ] 로컬에서 backend `npm start` 실행 성공
- [ ] MongoDB Atlas 연결 확인
- [ ] Git 저장소에 첫 커밋 완료

**예상 리스크:**
- MongoDB Atlas 무료 티어 제한 → Firebase Firestore 대안 준비

---

### Phase 2: 인증 시스템 구현 (5-6일)

#### TAG: `AUTH-SYSTEM-002`

**목표:** 사용자 회원가입, 로그인, JWT 인증 완성

**상세 작업:**

1. **Backend - User Model & Auth Routes** (2일)
   - `models/User.js` 작성
   - `controllers/authController.js` 구현
     - `signup`: 이메일 중복 검사, bcrypt 해싱
     - `login`: 비밀번호 검증, JWT 발급
   - `routes/authRoutes.js` 라우트 정의
   - `middleware/authMiddleware.js` JWT 검증 미들웨어
   - Joi를 이용한 요청 검증

2. **Backend - 테스트 작성** (1일)
   - `tests/integration/auth.test.js`
   - 회원가입 성공/실패 케이스
   - 로그인 성공/실패 케이스
   - JWT 검증 테스트

3. **Frontend - Auth UI 구현** (2일)
   - `pages/LoginPage.jsx` 디자인
   - `pages/SignupPage.jsx` 디자인
   - `components/common/Input.jsx` 재사용 컴포넌트
   - React Hook Form으로 폼 검증
   - TailwindCSS로 반응형 디자인

4. **Frontend - Auth Store & API 통합** (1일)
   - `store/authStore.js` Zustand 스토어
   - `api/authApi.js` Axios 호출 함수
   - `hooks/useAuth.js` 커스텀 훅
   - LocalStorage에 JWT 저장
   - Axios Interceptor로 자동 토큰 첨부

**완료 조건:**
- [ ] Postman에서 모든 Auth API 테스트 통과
- [ ] Jest 테스트 전체 통과
- [ ] Frontend에서 회원가입 → 로그인 → JWT 저장 확인
- [ ] 보호된 라우트 접근 시 자동 리다이렉트

**예상 리스크:**
- JWT Refresh Token 미구현 → Phase 5에서 추가 고려

---

### Phase 3: Task CRUD 기능 구현 (7-8일)

#### TAG: `TASK-CRUD-003`

**목표:** 할 일 생성, 읽기, 수정, 삭제 완성 및 상태 관리 시스템 구현

**상세 작업:**

1. **Backend - Task Model & Status Management** (3일)
   - `models/Todo.js` Mongoose 스키마 with 상태 관리
     - 상태 필드: `todo`, `in_progress`, `done`, `cancelled`
     - 상태 이력 추적: `statusHistory` 배열
     - 유효 상태 전이 검증
   - `controllers/taskController.js` 구현
     - `GET /tasks`: 사용자별 할 일 목록 (페이지네이션)
     - `POST /tasks`: 새 할 일 생성
     - `PUT /tasks/:id`: 할 일 수정
     - `DELETE /tasks/:id`: 할 일 삭제
     - `PATCH /tasks/:id/status`: 상태 업데이트 with 이력 추적
   - 권한 검증 (본인 할 일만 수정/삭제)
   - 상태 전이 유효성 검증 로직

2. **Backend - 테스트 작성** (1.5일)
   - `tests/integration/tasks.test.js`
   - CRUD 전체 시나리오 테스트
   - 권한 검증 테스트
   - 상태 전이 유효성 검증 테스트
   - 상태 이력 추적 테스트

3. **Frontend - Task Components with Status Management** (3일)
   - `components/task/TaskCard.jsx`: 할 일 카드 UI with 상태 표시
   - `components/task/TaskForm.jsx`: 생성/수정 폼 (모달)
   - `components/task/TaskList.jsx`: 할 일 목록 렌더링
   - 상태 전이 UI 드롭다운 (todo → in_progress → done)
   - 상태 이력 모달 (상태 변경 이력 시각화)
   - 우선순위별 색상 구분
   - 상태에 따른 뷐전 표시 (진행률 표시기)

4. **Frontend - Task Store & Status API** (2일)
   - `store/taskStore.js` Zustand 스토어 with 상태 관리
   - `api/tasksApi.js` CRUD API 호출 + 상태 업데이트 API
   - `hooks/useTasks.js` 커스텀 훅 with 상태 추적
   - Optimistic UI 업데이트 with 상태 변경 반영
   - `hooks/useTaskStatusHistory.js` 상태 이용 추적 훅

5. **Frontend - HomePage 통합** (0.5일)
   - `pages/HomePage.jsx`에 TaskList 통합
   - 로딩 상태, 에러 처리
   - 빈 상태 UI (할 일 없을 때)

**완료 조건:**
- [ ] Postman에서 모든 Task API 테스트 통과
- [ ] Frontend에서 할 일 추가/수정/삭제 동작 확인
- [ ] 상태 전이 기능 (todo → in_progress → done) UI 즉시 반영
- [ ] 상태 이력 모달에서 변경 이력 조회 가능
- [ ] 권한 없는 사용자의 수정 시도 차단
- [ ] MongoDB 연결 최적화 및 타임아웃 설정 확인

**예상 리스크:**
- 대량 데이터 시 성능 저하 → 페이지네이션 구현 필수
- 상태 전이 복잡도 증가 → 상태 유효성 검증 로직 단순화 필요
- MongoDB 타임아웃 발생 → 연결 풀링 및 타임아웃 설정 최적화

---

### Phase 4: 상태 관리 시스템 (10일) - ✅ 완료

#### TAG: `TODO-STATUS-001`

**목표:** 할 일 상태 관리 시스템 구현 (TAG-001 ~ TAG-005)

**상세 작업:**

1. **Backend - 데이터 모델 확장** (2일)
   - Task 스키마에 status 필드 추가 (pending, in_progress, completed, cancelled)
   - statusHistory 배열 필드 추가 (변경 이력 추적)
   - MongoDB 인덱스 생성 (status, statusHistory.changedAt)
   - 상태 전환 규칙 검증 로직 구현
   - 데이터 마이그레이션 스크립트 작성

2. **Backend - Status API 구현** (3일)
   - `PUT /api/todos/:id/status` - 상태 변경 API
   - `GET /api/todos/:id/status-history` - 상태 이력 조회 API
   - `GET /api/todos/stats` - 상태별 통계 API
   - `GET /api/todos?status=pending,in_progress` - 상태 기반 필터링 API
   - 상태 변경 트랜잭션 및 데이터 일관성 보장

3. **Frontend - Status UI 컴포넌트** (3일)
   - `components/task/StatusSelector.jsx` - 상태 선택 드롭다운
   - `components/task/StatusFilter.jsx` - 상태 필터링 컴포넌트
   - `components/task/StatusStats.jsx` - 상태별 통계 표시
   - `components/task/StatusHistory.jsx` - 상태 변경 이력 타임라인
   - 실시간 상태 업데이트 및 사용자 피드백

4. **Frontend - 상태 관리 통합** (2일)
   - Zustand 상태 관리와 상태 변경 로직 연동
   - 상태 필터링 전역 상태 관리
   - API 호출 최적화 및 에러 처리

**완료 조건:**
- [ ] 4단계 상태 시스템 완벽 구현
- [ ] 상태 변경 이력 정확 기록
- [ ] 실시간 필터링 및 통계 동작
- [ ] 모든 API 엔드포인트 성능 테스트 통과
- [ ] 단위/통합 테스트 90% 커버리지 달성

**실제 결과:**
- ✅ TAG-001: 데이터베이스 스키마 확장 완료
- ✅ TAG-002: 상태 변경 API 엔드포인트 구현 완료
- ✅ TAG-003: 상태 변경 이력 추적 시스템 구현 완료
- ✅ TAG-004: 상태 기반 필터링 UI 구현 완료
- ✅ TAG-005: 상태별 통계 기능 구현 완료
- ✅ 모든 기능 요구사항 100% 구현 완료
- ✅ 모든 수용 기준 시나리오 통과
- ✅ 성능 테스트 응답 시간 목표 달성

---

### Phase 5: 필터/검색/정렬 기능 (4-5일) - ⏳ 예정

#### TAG: `FILTER-SEARCH-004`

**목표:** 할 일 필터링, 검색, 정렬 기능 완성 (이전 Phase 4 였으나 번호 조정)

**상세 작업:**

1. **Backend - 쿼리 최적화** (1.5일)
   - `GET /tasks`에 쿼리 파라미터 추가
     - `?completed=true/false`
     - `?priority=high/medium/low`
     - `?tags=공부,업무`
     - `?search=검색어`
     - `?sortBy=dueDate/priority/createdAt`
     - `?order=asc/desc`
   - MongoDB 인덱스 최적화
   - 페이지네이션 구현 (`?page=1&limit=20`)

2. **Frontend - Filter UI** (2일)
   - `components/task/TaskFilter.jsx` 필터 바 구현
   - 드롭다운으로 완료 상태 필터
   - 우선순위 선택 (체크박스 또는 태그)
   - 태그 다중 선택

3. **Frontend - Search & Sort** (1.5일)
   - `components/common/SearchBar.jsx` 검색창
   - useDebounce 훅으로 검색 최적화
   - 정렬 드롭다운 (날짜순, 우선순위순)
   - URL 쿼리 파라미터와 동기화

**완료 조건:**
- [ ] 검색 입력 시 0.5초 딜레이 후 API 호출
- [ ] 필터 변경 시 URL 업데이트
- [ ] 브라우저 뒤로가기 시 필터 상태 유지
- [ ] 복합 필터 조합 테스트 (예: "완료 + 높은 우선순위 + 검색어")

**예상 리스크:**
- 복잡한 쿼리 시 성능 저하 → 인덱스 추가, 캐싱 고려

---

### Phase 5: UI/UX 개선 & 배포 (5-6일)

#### TAG: `UI-UX-DEPLOY-005`

**목표:** 반응형 디자인, 다크 모드, 배포 완성

**상세 작업:**

1. **다크 모드 구현** (1.5일)
   - Tailwind의 `dark:` 클래스 활용
   - `store/uiStore.js`에 테마 상태 관리
   - LocalStorage에 테마 설정 저장
   - 시스템 설정 감지 (`prefers-color-scheme`)

2. **반응형 디자인 최적화** (1.5일)
   - 모바일 (< 640px): 단일 컬럼, 하단 네비게이션
   - 태블릿 (640-1024px): 사이드바 축소
   - 데스크톱 (> 1024px): 전체 사이드바
   - 터치 이벤트 최적화

3. **LocalStorage 동기화** (1일)
   - 비로그인 사용자용 LocalStorage 저장
   - 로그인 시 LocalStorage 데이터를 서버로 마이그레이션
   - `hooks/useLocalStorage.js` 구현

4. **배포 준비** (1.5일)
   - **Frontend (Vercel)**
     - `vercel.json` 설정
     - 환경 변수 설정 (API URL)
     - 빌드 최적화 (code splitting)
   - **Backend (Render)**
     - `render.yaml` 설정
     - 환경 변수 설정 (JWT_SECRET, MONGO_URI)
     - Health check 엔드포인트 (`GET /health`)

5. **CI/CD 파이프라인** (0.5일)
   - GitHub Actions 설정
   - PR 시 자동 테스트 실행
   - main 브랜치 머지 시 자동 배포

**완료 조건:**
- [ ] 모든 디바이스 크기에서 UI 정상 작동
- [ ] 다크 모드 전환 시 깜빡임 없음
- [ ] 비로그인 사용자도 LocalStorage로 기능 사용 가능
- [ ] Vercel, Render 배포 성공
- [ ] 프로덕션 환경에서 HTTPS 확인

**예상 리스크:**
- CORS 오류 → Backend에 프로덕션 도메인 화이트리스트 추가
- 환경 변수 노출 → .env 파일 절대 커밋 금지

---

### Phase 6: UI/UX 개선 & 배포 (5-6일) - ⏳ 예정

#### TAG: `UI-UX-DEPLOY-005`

**목표:** 반응형 디자인, 다크 모드, 배포 완성 (Phase 5 였으나 번호 조정)

**상세 작업:**

1. **E2E 테스트** (1.5일)
   - Playwright 또는 Cypress 설치
   - 핵심 사용자 플로우 테스트
     - 회원가입 → 로그인 → 할 일 추가 → 완료 처리 → 삭제
   - 크로스 브라우저 테스트 (Chrome, Firefox, Safari)

2. **성능 최적화** (1.5일)
   - React.memo로 불필요한 리렌더링 방지
   - 이미지 최적화 (WebP 변환)
   - Code splitting (React.lazy)
   - Lighthouse 점수 90+ 달성

3. **보안 강화** (0.5일)
   - Helmet으로 보안 헤더 설정
   - Rate Limiting 추가 (express-rate-limit)
   - XSS 방지 (입력 sanitization)

4. **버그 수정 및 리팩토링** (0.5일)
   - 코드 리뷰 진행
   - 발견된 버그 수정
   - 중복 코드 제거

**완료 조건:**
- [ ] E2E 테스트 전체 통과
- [ ] Lighthouse Performance 점수 90+
- [ ] 보안 취약점 스캔 통과 (npm audit)
- [ ] 주요 브라우저에서 동작 확인

---

## 5. TAG 체인 설계

### 5.1 TAG 명명 규칙

**포맷:** `[PHASE]-[FEATURE]-[NUMBER]`

**예시:**
* `SETUP-ENV-001`: 프로젝트 초기 설정
* `AUTH-SYSTEM-002`: 인증 시스템
* `TASK-CRUD-003`: Task CRUD
* `FILTER-SEARCH-004`: 필터링/검색
* `UI-UX-DEPLOY-005`: UI/UX 및 배포
* `TEST-OPTIMIZE-006`: 테스트 및 최적화

### 5.2 TAG 추적 시스템

**Git Commit 메시지 포맷:**
```
[TAG] 타입: 간단한 설명

상세 설명 (선택 사항)

TAG: PHASE-FEATURE-NUMBER
```

**예시:**
```
[AUTH-SYSTEM-002] feat: JWT 기반 로그인 API 구현

- bcrypt로 비밀번호 해싱
- jsonwebtoken으로 토큰 발급
- authMiddleware로 토큰 검증

TAG: AUTH-SYSTEM-002
```

### 5.3 TAG 의존성 다이어그램

```
SETUP-ENV-001
    ↓
AUTH-SYSTEM-002
    ↓
TASK-CRUD-003
    ↓
TODO-STATUS-001 ✅ (완료)
    ↓
FILTER-SEARCH-004
    ↓
UI-UX-DEPLOY-005
    ↓
TEST-OPTIMIZE-006
```

### 5.4 Phase별 브랜치 전략

```
main (프로덕션)
  ↑
develop (개발)
  ↑
  ├── feature/setup-env-001 ✅
  ├── feature/auth-system-002 ✅
  ├── feature/task-crud-003 ✅
  ├── feature/todo-status-001 ✅ (완료)
  ├── feature/filter-search-004
  ├── feature/ui-ux-deploy-005
  └── feature/test-optimize-006
```

**브랜치 병합 규칙:**
1. Feature 브랜치에서 작업
2. PR 생성 시 자동 테스트 실행
3. 코드 리뷰 후 develop에 병합
4. develop이 안정화되면 main에 병합

---

## 6. 위험 요소 및 대응 방안

### 6.1 기술적 위험

| 위험 요소 | 발생 확률 | 영향도 | 대응 방안 |
|----------|----------|--------|----------|
| MongoDB Atlas 무료 티어 제한 (512MB) | 중간 | 높음 | - Firebase Firestore 대안 준비<br>- 로컬 MongoDB 개발 환경 구축 |
| JWT Refresh Token 미구현 시 보안 취약 | 높음 | 중간 | - Phase 5에서 Refresh Token 추가<br>- Access Token 만료 시간 15분 제한 |
| CORS 오류 (배포 환경) | 높음 | 중간 | - Backend에 프로덕션 도메인 화이트리스트<br>- preflight 요청 처리 |
| 대량 데이터 시 성능 저하 | 중간 | 중간 | - 페이지네이션 구현 (20개씩)<br>- MongoDB 인덱스 최적화<br>- React Virtualization 고려 |
| 소셜 로그인 구현 복잡도 | 낮음 | 낮음 | - Phase 1에서 제외, 향후 확장 계획으로 이동 |

### 6.2 일정 위험

| 위험 요소 | 대응 방안 |
|----------|----------|
| 예상보다 긴 디버깅 시간 | - 각 Phase에 1일 버퍼 추가<br>- 일일 스탠드업으로 진행 상황 점검 |
| 외부 서비스 장애 (Vercel, Render) | - 로컬 환경에서 테스트 완료 후 배포<br>- Docker 컨테이너화 대안 준비 |
| 학습 곡선 (Zustand, TailwindCSS) | - Phase 1에서 공식 문서 학습 시간 확보<br>- 샘플 프로젝트 참고 |

### 6.3 품질 위험

| 위험 요소 | 대응 방안 |
|----------|----------|
| 테스트 커버리지 부족 | - Phase 2부터 TDD 적용<br>- 최소 70% 커버리지 목표 |
| 반응형 디자인 불완전 | - Phase 5에서 실제 디바이스 테스트<br>- Chrome DevTools 시뮬레이션 |
| 접근성 미준수 | - 키보드 네비게이션 테스트<br>- ARIA 속성 추가<br>- Lighthouse 접근성 점수 90+ |

---

## 7. 다음 단계 가이드

### 7.1 즉시 시작 가능한 작업

1. **GitHub 저장소 생성**
   ```bash
   # Frontend
   gh repo create todo-frontend --public

   # Backend
   gh repo create todo-backend --public
   ```

2. **MongoDB Atlas 설정**
   - https://www.mongodb.com/cloud/atlas/register 회원가입
   - Free Tier 클러스터 생성
   - Database User 생성 (username, password)
   - Network Access에 `0.0.0.0/0` 추가 (개발 단계)
   - Connection String 복사

3. **Frontend 프로젝트 초기화**
   ```bash
   npm create vite@latest todo-frontend -- --template react
   cd todo-frontend
   npm install
   npm install tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   npm install zustand axios react-router-dom react-hook-form date-fns
   ```

4. **Backend 프로젝트 초기화**
   ```bash
   mkdir todo-backend && cd todo-backend
   npm init -y
   npm install express mongoose jsonwebtoken bcrypt joi helmet cors dotenv
   npm install --save-dev nodemon jest supertest eslint
   ```

### 7.2 첫 주 목표

**Day 1-2:**
- [ ] 개발 환경 설정 완료
- [ ] Frontend Vite 프로젝트 실행 확인
- [ ] Backend Express 서버 실행 확인
- [ ] MongoDB Atlas 연결 테스트

**Day 3-4:**
- [ ] Tailwind 설정 완료 (다크 모드 포함)
- [ ] 기본 라우팅 구조 생성
- [ ] User 모델 및 Auth 라우트 기본 구조

### 7.3 체크리스트 템플릿

각 Phase 시작 전 확인:
- [ ] 이전 Phase 완료 조건 모두 충족
- [ ] Git 브랜치 생성 (`feature/[TAG]`)
- [ ] 필요한 라이브러리 설치 확인
- [ ] 작업 범위 명확히 이해

각 Phase 완료 후:
- [ ] 테스트 작성 및 통과
- [ ] 코드 리뷰 (셀프 리뷰 포함)
- [ ] Git 커밋 (TAG 포함)
- [ ] develop 브랜치에 PR 생성
- [ ] 문서 업데이트 (README, API 문서)

### 7.4 참고 자료

**공식 문서:**
* React: https://react.dev/
* TailwindCSS: https://tailwindcss.com/docs
* Zustand: https://zustand-demo.pmnd.rs/
* Express: https://expressjs.com/
* Mongoose: https://mongoosejs.com/

**튜토리얼:**
* JWT 인증: https://jwt.io/introduction
* React Hook Form: https://react-hook-form.com/get-started
* MongoDB Atlas: https://www.mongodb.com/docs/atlas/

**디자인 참고:**
* Tailwind UI: https://tailwindui.com/components
* Figma 템플릿: "To-Do List" 검색

---

## 8. 성공 지표 (KPI)

### 8.1 기술적 지표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 테스트 커버리지 | 70% 이상 | Jest 커버리지 리포트 |
| Lighthouse Performance | 90+ | Chrome DevTools |
| API 응답 시간 | < 200ms | Postman 측정 |
| 번들 크기 | < 500KB (gzipped) | Webpack Bundle Analyzer |
| 접근성 점수 | 90+ | Lighthouse Accessibility |

### 8.2 사용자 경험 지표

| 지표 | 목표 |
|------|------|
| 첫 페이지 로딩 시간 | < 2초 |
| 할 일 추가 클릭 수 | < 3회 |
| 모바일 사용성 | 터치 타겟 최소 44x44px |
| 크로스 브라우저 호환성 | Chrome, Firefox, Safari, Edge |

### 8.3 프로젝트 관리 지표

| 지표 | 목표 |
|------|------|
| Phase별 일정 준수율 | 80% 이상 |
| 버그 해결 시간 | < 2일 |
| 코드 리뷰 소요 시간 | < 1일 |
| 배포 성공률 | 95% 이상 |

---

## 9. 향후 확장 계획 (Post-MVP)

### 9.1 Phase 7: 소셜 로그인 (2-3일)
- Google OAuth 2.0 연동
- Kakao REST API 연동
- Passport.js 도입

### 9.2 Phase 8: 실시간 기능 (3-4일)
- Socket.io로 실시간 동기화
- 브라우저 푸시 알림 (Service Worker)

### 9.3 Phase 9: 협업 기능 (5-7일)
- 할 일 공유 (공유 링크 생성)
- 팀 워크스페이스
- 댓글 및 멘션

### 9.4 Phase 10: AI 기능 (7-10일)
- OpenAI API로 할 일 자동 분류
- 주간 리포트 자동 생성
- 우선순위 자동 추천

---

## 10. 결론

본 구현 계획서는 To-Do List 웹앱을 5주 내에 완성하기 위한 상세 로드맵을 제공합니다.

**핵심 원칙:**
1. **점진적 개발**: Phase별로 완성도를 높여가며 진행
2. **테스트 주도**: 각 Phase마다 테스트 작성 필수
3. **문서화**: TAG 체인으로 추적 가능성 확보
4. **위험 관리**: 예상 위험에 대한 대응 방안 사전 준비

**다음 액션:**
1. GitHub 저장소 생성
2. MongoDB Atlas 설정
3. Phase 1 작업 시작 (프로젝트 초기화)

**문의 사항:**
- 기술 스택 변경 필요 시 재검토 가능
- Phase별 일정 조정 가능 (버퍼 1-2일 고려)
- 우선순위 변경 시 TAG 체인 업데이트

---

**문서 버전:** 1.0.0
**최종 수정일:** 2025-10-30
**작성자:** Implementation Planner Agent
**승인자:** [프로젝트 관리자명]
