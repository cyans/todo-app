---
id: ARCHITECTURE-001
version: 1.1.0
status: active
created: 2025-11-10
updated: 2025-11-10
author: @doc-syncer
priority: high
---

# 🏗️ 시스템 아키텍처 문서

## HISTORY

### v1.1.0 (2025-11-10)
- **UPDATED**: Docker 컨테이너 아키텍처 및 UI/UX 개선사항 반영
- **AUTHOR**: @doc-syncer
- **USER**: GOOS (cyans)
- **LANGUAGE**: 한국어 (ko)
- **STATUS**: 완전한 컨테이너화 아키텍처와 현대적인 UI/UX 시스템

---

## @DOC:ARCH-001 아키텍처 개요

### 아키텍처 비전

Todo 애플리케이션은 현대적인 풀스택 아키텍처를 기반으로 한 확장 가능하고 안정적인 시스템입니다. 컨테이너화와 마이크로서비스 패턴을 적용하여 배포성과 유지보수성을 최적화했습니다.

```
Todo 애플리케이션 아키텍처 (v1.1.0)
┌─────────────────────────────────────────────────────────────┐
│                    프레젠테이션 레이어                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite + TailwindCSS)                     │
│  ├── components/        # UI 컴포넌트                       │
│  ├── services/         # API 클라이언트                      │
│  ├── styles/           # TailwindCSS 스타일링               │
│  └── utils/            # 유틸리티 함수                       │
├─────────────────────────────────────────────────────────────┤
│                   API 게이트웨이 레이어                       │
├─────────────────────────────────────────────────────────────┤
│  Nginx (프로덕션) / Direct (개발)                          │
│  ├── 리버스 프록시                                           │
│  ├── 정적 파일 서빙                                         │
│  ├── 로드 밸런싱                                             │
│  └── 보안 헤더                                               │
├─────────────────────────────────────────────────────────────┤
│                     비즈니스 로직 레이어                       │
├─────────────────────────────────────────────────────────────┤
│  Backend (Express.js + Node.js)                           │
│  ├── routes/          # API 엔드포인트                       │
│  ├── services/        # 비즈니스 로직                        │
│  ├── middleware/      # 교차 기능                           │
│  └── utils/           # 유틸리티 함수                        │
├─────────────────────────────────────────────────────────────┤
│                    데이터 접근 레이어                         │
├─────────────────────────────────────────────────────────────┤
│  MongoDB (Mongoose ODM)                                    │
│  ├── todos 컬렉션                                           │
│  ├── 인덱싱 최적화                                          │
│  ├── 상태 히스토리 관리                                      │
│  └── 검색 성능 최적화                                        │
├─────────────────────────────────────────────────────────────┤
│                   인프라 레이어 (컨테이너)                    │
├─────────────────────────────────────────────────────────────┤
│  Docker + Docker Compose                                   │
│  ├── 컨테이너 오케스트레이션                                   │
│  ├── 상태 점검 및 모니터링                                   │
│  ├── 자동 확장                                               │
│  └── 롤링 업데이트                                           │
└─────────────────────────────────────────────────────────────┘
```

### 아키텍처 원칙

1. **단일 책임 원칙 (SRP)**: 각 레이어는 명확한 책임을 가짐
2. **개방-폐쇄 원칙 (OCP)**: 확장에는 열려있고, 수정에는 닫혀있음
3. **의존성 역전 원칙 (DIP)**: 추상화에 의존함
4. **컨테이너화**: 모든 서비스가 독립적인 컨테이너로 배포
5. **상태 점검**: 모든 컴포넌트의 상태를 모니터링

---

## @DOC:FRONTEND-001 프론트엔드 아키텍처

### 프론트엔드 기술 스택

```yaml
# 핵심 기술 스택
framework: React 19.1.1
build_tool: Vite 7.1.7
styling: TailwindCSS 4.1.16
state_management: Zustand 5.0.8
http_client: Axios 1.13.1
form_handling: React Hook Form 7.65.0
testing: Vitest 4.0.7 + React Testing Library
```

### 컴포넌트 구조

```
frontend/src/
├── components/          # UI 컴포넌트
│   ├── TodoList/        # 메인 Todo 리스트
│   │   ├── TodoList.jsx     # 리스트 컴포넌트
│   │   ├── TodoList.test.js # 테스트 파일
│   │   └── index.js         # 익스포트
│   ├── TodoItem/        # 개별 Todo 항목
│   │   ├── TodoItem.jsx     # 항목 컴포넌트
│   │   ├── TodoItem.test.js # 테스트 파일
│   │   └── index.js         # 익스포트
│   ├── TodoForm/        # Todo 생성/수정 폼
│   ├── SearchBar/       # 검색 바
│   ├── FilterControls/  # 필터 컨트롤
│   └── StatusBar/       # 상태 바
├── services/            # API 서비스
│   └── api.js           # API 클라이언트
├── hooks/               # 커스텀 훅
│   ├── useTodos.js      # Todo 데이터 관리
│   ├── useSearch.js     # 검색 기능
│   └── useVoiceSearch.js # 음성 검색
├── styles/             # 스타일
│   └── index.css        # TailwindCSS 설정
└── utils/              # 유틸리티
    ├── validators.js   # 검증 유틸리티
    └── helpers.js      # 헬퍼 함수
```

### 상태 관리 아키텍처

#### Zustand 스토어 구조
```javascript
// stores/todoStore.js
export const useTodoStore = create((set, get) => ({
  // 상태
  todos: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    search: ''
  },

  // 액션
  fetchTodos: async () => {
    // API 호출 로직
  },

  addTodo: async (todoData) => {
    // Todo 생성 로직
  },

  updateTodo: async (id, updates) => {
    // Todo 업데이트 로직
  },

  deleteTodo: async (id) => {
    // Todo 삭제 로직
  },

  setFilter: (filter, value) => {
    // 필터 설정 로직
  }
}));
```

### 라우팅 및 네비게이션

```javascript
// App.jsx - 프론트엔드 라우팅 (단일 페이지 애플리케이션)
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<TodoList />} />
            <Route path="/todo/:id" element={<TodoDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
```

---

## @DOC:BACKEND-001 백엔드 아키텍처

### 백엔드 기술 스택

```yaml
# 핵심 기술 스택
runtime: Node.js 20.x LTS
framework: Express 5.1.0
database: MongoDB 7.0.x
odm: Mongoose 8.19.2
validation: Joi 18.0.1
security: Helmet 8.1.0, CORS 2.8.5
logging: Winston 3.18.3
testing: Jest + Supertest
```

### 모듈 아키텍처

```
backend/src/
├── routes/             # API 라우팅
│   ├── todo-routes.js  # Todo 관련 API
│   └── index.js        # 라우터 통합
├── services/           # 비즈니스 로직
│   ├── todo-service.js # Todo 비즈니스 로직
│   └── index.js        # 서비스 통합
├── middleware/         # 미들웨어
│   ├── performance.js  # 성능 모니터링
│   ├── logger.js       # 로깅
│   ├── helmet.js       # 보안 헤더
│   └── cors.js         # CORS 설정
├── config/             # 설정
│   ├── database.js     # 데이터베이스 연결
│   └── index.js        # 설정 통합
├── utils/              # 유틸리티
│   └── logger.js       # 로깅 유틸리티
└── app.js              # Express 앱 설정
```

### 서비스 계층 아키텍처

#### Todo 서비스 구조
```javascript
// services/todo-service.js
class TodoService {
  constructor() {
    this.todoModel = Todo;
  }

  // CRUD 연산
  async createTodo(todoData) {
    // 1. 데이터 검증
    // 2. 비즈니스 로직 적용
    // 3. 데이터베이스 작업
    // 4. 결과 반환
  }

  async getTodos(filter, options) {
    // 1. 필터링 로직
    // 2. 페이지네이션
    // 3. 정렬
    // 4. 데이터베이스 쿼리
  }

  async updateTodo(id, updates) {
    // 1. 데이터 검증
    // 2. 상태 변경 로직
    // 3. 히스토리 기록
    // 4. 데이터베이스 업데이트
  }

  async deleteTodo(id) {
    // 1. 데이터 검증
    // 2. 삭제 로직
    // 3. 데이터베이스 삭제
  }

  // 검색 기능
  async searchTodos(query, options) {
    // 1. 텍스트 검색
    // 2. 필터링
    // 3. 결과 정렬
  }
}
```

### API 레이어 아키텍처

#### 라우터 구조
```javascript
// routes/todo-routes.js
const router = express.Router();

// 상태 점검
router.get('/health', performanceMonitor, todoController.getHealth);

// CRUD 연산
router.post('/', validationMiddleware, todoController.createTodo);
router.get('/', filterValidation, todoController.getTodos);
router.get('/:id', todoController.getTodoById);
router.put('/:id', validationMiddleware, todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

// 상태 관리
router.patch('/:id/status', statusValidation, todoController.updateStatus);

// 검색 기능
router.get('/search/:query', todoController.searchTodos);

// 통계
router.get('/stats/overview', todoController.getStats);
```

### 미들웨어 아키텍처

```javascript
// middleware/index.js
const middlewares = {
  // 보안 미들웨어
  helmet: helmet(),
  cors: cors(corsOptions),

  // 파싱 미들웨어
  json: express.json(),
  urlencoded: express.urlencoded({ extended: true }),

  // 검증 미들웨어
  validate: (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details });
    next();
  },

  // 성능 모니터링
  performance: performanceMonitor,

  // 로깅
  logger: requestLogger,

  // 오류 처리
  errorHandler: errorHandlingMiddleware
};
```

---

## @DOC:DATABASE-001 데이터베이스 아키텍처

### MongoDB 스키마 설계

#### Todo 문서 구조
```javascript
// models/Todo.js
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  statusHistory: [{
    fromStatus: String,
    toStatus: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: String,
      default: 'system'
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'todos',
  versionKey: false
});

// 인덱스 설정
todoSchema.index({ createdAt: -1 });
todoSchema.index({ status: 1, priority: -1 });
todoSchema.index({ text: 'text', tags: 'text' });
todoSchema.index({ dueDate: 1 });
todoSchema.index({ statusHistory: changedAt: -1 });
```

### 데이터 모델 관계성

```
Todo 모델 관계성
├── Todo (메인)
│   ├── statusHistory (1:N)
│   ├── tags (N:M)
│   └── dueDate (1:1)
└── User (향후 확장)
    ├── todos (1:N)
    └── settings (1:1)
```

### 데이터베이스 인덱싱 전략

#### 성능 최적화를 위한 인덱스
```javascript
// 자동 생성 인덱스
- _id: 기본 인덱스
- createdAt: -1 (최신숫 정렬)
- status: 1, priority: -1 (상태별 우선순위)
- text: 'text' (텍스트 검색)
- tags: 'text' (태그 검색)
- dueDate: 1 (마감일 정렬)

// 조합 인덱스
- status + priority + createdAt (필터링 + 정렬)
- text 검색 + status 필터 (검색 성능)
```

---

## @DOC:DOCKER-001 Docker 아키텍처

### 컨테이너 아키텍처

```
Docker 컴포넌트 구조
├── backend/
│   ├── Dockerfile           # 다단계 빌드
│   ├── healthcheck.js       # 상태 점검
│   └── .dockerignore        # 빌드 제외 파일
├── frontend/
│   ├── Dockerfile           # 다단계 빌드
│   ├── nginx.conf           # Nginx 설정
│   └── .dockerignore        # 빌드 제외 파일
├── docker-compose.yml       # 개발 환경
├── docker-compose.prod.yml  # 프로덕션 환경
└── docker-compose.override.yml  # 개발 환경 오버라이드
```

### 백엔드 Dockerfile 구조

```dockerfile
# Dockerfile (백엔드)
# 스테이지 1: 빌드
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 스테이지 2: 실행
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js
CMD ["npm", "start"]
```

### 프론트엔드 Dockerfile 구조

```dockerfile
# Dockerfile (프론트엔드)
# 스테이지 1: 빌드
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 스테이지 2: Nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose 아키텍처

#### 개발 환경
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment: ["NODE_ENV=development"]
    volumes: ["./backend:/app"]
    depends_on: [mongo]

  frontend:
    build: ./frontend
    ports: ["3000:80"]
    volumes: ["./frontend:/app"]
    depends_on: [backend]

  mongo:
    image: mongo:6.0-alpine
    volumes: ["mongo_data:/data/db"]
```

#### 프로덕션 환경
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    ports: ["5000:5000"]
    environment: ["NODE_ENV=production"]
    restart: unless-stopped
    healthcheck: [상태 점검 설정]

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    ports: ["80:80"]
    restart: unless-stopped
    depends_on: [backend]

  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes: ["./nginx/nginx.conf:/etc/nginx/nginx.conf"]
    depends_on: [frontend, backend]
```

---

## @DOC:NETWORKING-001 네트워크 아키텍처

### 네트워크 토폴로지

```
네트워크 아키텍처
┌─────────────────────────────────────────────────────────────┐
│                     사용자/클라이언트                          │
├─────────────────────────────────────────────────────────────┤
│  인터넷 (HTTPS) → CDN → 로드 밸런서 → 웹 서버                │
├─────────────────────────────────────────────────────────────┤
│                    프론트엔드 계층                            │
├─────────────────────────────────────────────────────────────┤
│  Nginx (프로덕션) / React 개발 서버 (개발)                    │
│  ├── 정적 파일 서빙                                          │
│  ├── 리버스 프록시                                          │
│  └── 캐싱                                                   │
├─────────────────────────────────────────────────────────────┤
│                     백엔드 계층                              │
├─────────────────────────────────────────────────────────────┤
│  Express.js (Node.js)                                       │
│  ├── RESTful API                                            │
│  ├── 상태 점검 엔드포인트                                     │
│  └── 보안 미들웨어                                           │
├─────────────────────────────────────────────────────────────┤
│                    데이터 계층                               │
├─────────────────────────────────────────────────────────────┤
│  MongoDB 데이터베이스                                         │
│  ├── 데이터 저장소                                           │
│  ├── 인덱싱                                                 │
│  └── 복제본 (프로덕션)                                        │
└─────────────────────────────────────────────────────────────┘
```

### API 게이트웨이 구조

#### Nginx 리버스 프록시 설정
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    upstream frontend {
        server frontend:80;
    }

    server {
        listen 80;
        server_name localhost;

        # 정적 파일 캐싱
        location /static/ {
            alias /app/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API 프록시
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # 타임아웃 설정
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # 프론트엔드 라우팅
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## @DOC:SECURITY-001 보안 아키텍처

### 보안 레이어

```
보안 아키텍처
┌─────────────────────────────────────────────────────────────┐
│                     물리적 보안                              │
├─────────────────────────────────────────────────────────────┤
│  데이터 센터 접근 제어, 네트워크 격리                        │
├─────────────────────────────────────────────────────────────┤
│                     네트워크 보안                            │
├─────────────────────────────────────────────────────────────┤
│  방화벽, IDS/IPS, VPN, SSL/TLS 암호화                       │
├─────────────────────────────────────────────────────────────┤
│                     호스트 보안                             │
├─────────────────────────────────────────────────────────────┤
│  OS 패치, 컨테이너 격리, SELinux/AppArmor                    │
├─────────────────────────────────────────────────────────────┤
│                     애플리케이션 보안                       │
├─────────────────────────────────────────────────────────────┤
│  입력 검증, 인증/인가, SQL 인젝션 방어                       │
├─────────────────────────────────────────────────────────────┤
│                     데이터 보안                              │
├─────────────────────────────────────────────────────────────┤
│  암호화 저장, 백업, 접근 제어                               │
└─────────────────────────────────────────────────────────────┘
```

### 보안 미들웨어 구조

```javascript
// security/middleware.js
const securityMiddlewares = {
  // Helmet 보안 헤더
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  }),

  // CORS 설정
  cors: cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }),

  // 요제한 설정
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100 // IP당 요청 제한
  }),

  // 보안 헤더
  securityHeaders: (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  }
};
```

---

## @DOC:MONITORING-001 모니터링 아키텍처

### 모니터링 시스템

```
모니터링 아키텍처
┌─────────────────────────────────────────────────────────────┐
│                     사용자 인터페이스                        │
├─────────────────────────────────────────────────────────────┤
│  Grafana, Prometheus UI, Alertmanager                       │
├─────────────────────────────────────────────────────────────┤
│                     메트릭 수집                             │
├─────────────────────────────────────────────────────────────┤
│  Prometheus, Node Exporter, Docker Exporter                 │
├─────────────────────────────────────────────────────────────┤
│                     로그 수집                                │
├─────────────────────────────────────────────────────────────┤
│  Winston, ELK Stack, Fluentd                                │
├─────────────────────────────────────────────────────────────┤
│                     추적 시스템                              │
├─────────────────────────────────────────────────────────────┤
│  Jaeger, OpenTelemetry, Zipkin                              │
├─────────────────────────────────────────────────────────────┤
│                     애플리케이션                             │
├─────────────────────────────────────────────────────────────┤
│  상태 점검, 성능 모니터링, 로깅, 추적                         │
└─────────────────────────────────────────────────────────────┘
```

### 상태 점검 시스템

#### 멀티 레벨 상태 점검
```javascript
// 상태 점검 엔드포인트
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      memory: checkMemory(),
      disk: checkDisk()
    }
  };

  res.json(health);
});

app.get('/ready', (req, res) => {
  // 애플리케이션 준비 상태 확인
  const ready = {
    ready: true,
    services: {
      database: databaseReady(),
      cache: cacheReady(),
      external: externalServicesReady()
    }
  };

  res.json(ready);
});

app.get('/live', (req, res) => {
  // 활성 상태 확인
  res.json({ alive: true });
});
```

---

## @DOC:SCALING-001 확장성 아키텍처

### 수직 확전 (Scale Up)

#### 리소스 관리
```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M
          cpus: '0.5'

  frontend:
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: '0.5'
        reservations:
          memory: 64M
          cpus: '0.25'
```

### 수평 확장 (Scale Out)

#### 로드 밸런싱
```nginx
# nginx.conf - 로드 밸런싱 설정
upstream backend {
    least_conn;

    backend1:5000;
    backend2:5000;
    backend3:5000;

    # 헬스 체크
    keepalive 32;
    keepalive_requests 1000;
    keepalive_timeout 60s;
}

server {
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## EARS for Architecture Requirements

### Using EARS for Architecture

Apply EARS patterns when documenting architecture requirements:

#### Architecture EARS Example
```markdown
### Ubiquitous Requirements (Baseline Architecture)
- The system shall adopt a microservices architecture.
- The system shall provide containerized deployment options.

### Event-driven Requirements
- WHEN a service fails, the system shall automatically restart it.
- WHEN resource usage exceeds 80%, the system shall scale horizontally.

### State-driven Requirements
- WHILE in production mode, the system shall enforce security policies.
- WHILE in development mode, the system shall provide debugging tools.

### Optional Features
- WHERE monitoring is required, the system may provide real-time metrics.
- WHERE scalability is critical, the system may support auto-scaling.

### Constraints
- IF security is compromised, the system shall isolate affected services.
- Response time shall remain under 200ms for 95% of requests.
```

---

**TAG:** @DOC:ARCHITECTURE-001 @CODE:TODO-BACKEND-001 @CODE:TODO-FRONTEND-001 @SPEC:SPEC-UI-UX-DEPLOY-005

**문서 관리**: 이 문서는 `/alfred:3-sync` 명령으로 자동 동기화됩니다. 모든 변경사항은 Git에 커밋되어야 합니다.