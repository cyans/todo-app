---
id: TECH-001
version: 1.1.0
status: active
created: 2025-11-08
updated: 2025-11-10
author: @project-manager
priority: high
---

# Todo 애플리케이션 기술 스택

## HISTORY

### v1.1.0 (2025-11-10)
- **UPDATED**: UI/UX 향상 및 Docker 배포 시스템 기술 업데이트
- **IMPLEMENTED**: 고급 모니터링 시스템, 성능 추적 기술, 배포 인프라
- **AUTHOR**: @doc-syncer
- **USER**: GOOS (cyans)
- **LANGUAGE**: 한국어 (ko)
- **STATUS**: TailwindCSS 도입 및 Docker 프로덕션 배포 시스템 추가
- **TAGS**: @CODE:TODO-BACKEND-001 @CODE:TODO-FRONTEND-001 @CODE:TODO-APP-001 @CODE:TODO-SERVICE-001 @CODE:TODO-API-002 @DOC:TODO-API-001 @CODE:TODO-APP-002

### v1.0.0 (2025-11-08)
- **UPDATED**: 기술 스택 분석 및 한국어 문서화
- **AUTHOR**: @project-manager
- **USER**: GOOS (cyans)
- **LANGUAGE**: 한국어 (ko)
- **STATUS**: 기존 Todo 애플리케이션 기술 스택 분석 완료

---

## @DOC:STACK-001 언어 및 런타임

### 주요 언어

- **언어**: JavaScript (Frontend: React, Backend: Node.js)
- **버전 범위**: Node.js 20.x LTS, React 19.1.1
- **근거**: JavaScript 생태계의 통일성으로 프론트엔드/백엔드 개발 효율성 극대화
- **패키지 관리자**: npm (프론트엔드), npm (백엔드)

### 다중 플랫폼 지원

| 플랫폼   | 지원 수준 | 검증 도구 | 주요 제약사항 |
| -------- | --------- | --------- | ------------- |
| **Windows** | 완전 지원 | GitHub Actions, 로컬 테스트 | 없음 |
| **macOS**   | 완전 지원 | GitHub Actions, 로컬 테스트 | 없음 |
| **Linux**   | 완전 지원 | GitHub Actions, Docker | 없음 |

## @DOC:FRAMEWORK-001 핵심 프레임워크 및 라이브러리

### 1. 프론트엔드 의존성

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "axios": "^1.13.1",
    "zustand": "^5.0.8",
    "react-router-dom": "^7.9.5",
    "react-hook-form": "^7.65.0",
    "date-fns": "^4.1.0"
  }
}
```

### 2. 프론트엔드 개발 도구

```json
{
  "devDependencies": {
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@vitejs/plugin-react": "^5.0.4",
    "vite": "^7.1.7",
    "vitest": "^4.0.7",
    "tailwindcss": "^4.1.16",
    "eslint": "^9.36.0",
    "postcss": "^8.5.3",
    "autoprefixer": "^10.4.20"
  }
}
```

### 3. 백엔드 의존성

```json
{
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.19.2",
    "joi": "^18.0.1",
    "helmet": "^8.1.0",
    "cors": "^2.8.5",
    "winston": "^3.18.3",
    "bcrypt": "^6.0.0",
    "jsonwebtoken": "^9.0.2"
  }
}
```

### 4. 빌드 시스템

- **빌드 도구**: Vite 7.1.7 (프론트엔드), Node.js (백엔드)
- **번들링**: Vite의 Rollup 기반 빌드 시스템
- **타겟**: Modern browsers (ES2020+), Node.js 20.x
- **성능 목표**: 빌드 시간 <30초, 초기 로드 <3초

## @DOC:QUALITY-001 품질 게이트 및 정책

### 테스트 커버리지

- **목표**: 95% (프론트엔드 및 백엔드 각각)
- **측정 도구**: Vitest (프론트엔드), Jest (백엔드)
- **실패 응답**: 커버리지 90% 미만 시 빌드 실패

### 정적 분석

| 도구 | 역할 | 설정 파일 | 실패 처리 |
| --- | ---- | --------- | --------- |
| ESLint | 코드 품질 | `.eslintrc.js` | 경고 시 빌드 경고 |
| Prettier | 코드 포맷팅 | `.prettierrc` | 자동 포맷팅 적용 |
| TypeScript | 타입 검증 | `tsconfig.json` | 타입 오류 시 빌드 실패 |

### 자동화 스크립트

```bash
# 품질 게이트 파이프라인
npm run test                 # 테스트 실행
npm run lint                 # 코드 품질 검사
npm run type-check           # 타입 검증
npm run build                # 빌드 검증
npm run test:coverage        # 커버리지 확인
```

## @DOC:SECURITY-001 보안 정책 및 운영

### 시크릿 관리

- **정책**: `.env` 파일을 통한 환경변수 관리, 절대 Git에 커밋 금지
- **도구**: `dotenv` 패키지, Docker secrets (프로덕션)
- **검증**: `dotenv-validation` 미들웨어로 필수 환경변수 확인

### 의존성 보안

```json
{
  "security": {
    "audit_tool": "npm audit",
    "update_policy": "자동 업데이트 (패치)",
    "vulnerability_threshold": "중간 이상 취약점 차단"
  }
}
```

### 로깅 정책

- **로그 레벨**: error, warn, info, debug (환경별 설정)
- **민감 데이터 마스킹**: 비밀번호, 토큰, 개인정보 자동 마스킹
- **보관 정책**: 30일 (개발), 90일 (프로덕션)

## @DOC:MONITORING-001 모니터링 시스템 기술 스택

### 모니터링 도구 및 기술

**Todo 애플리케이션은 완벽한 모니터링 시스템을 통해 실시간 상태 추적을 제공합니다.**

### 백엔드 모니터링 기술

```json
{
  "monitoring": {
    "performance": {
      "tool": "Express middleware",
      "metrics": ["response_time", "memory_usage", "cpu_usage"],
      "thresholds": {"response_time": "200ms", "memory": "100MB"}
    },
    "logging": {
      "tool": "Winston 3.18.3",
      "levels": ["error", "warn", "info", "debug"],
      "format": "structured",
      "transport": ["console", "file"]
    },
    "health_check": {
      "endpoints": ["/health", "/ready", "/live", "/startup"],
      "monitoring": "Docker health check",
      "frequency": "30s"
    }
  }
}
```

### 프론트엔드 모니터링 기술

```json
{
  "frontend_monitoring": {
    "performance": {
      "vite": "Vite 빌드 성능 모니터링",
      "react": "React 컴포넌트 성능 추적",
      "loading": "초기 로드 시간 측정"
    },
    "accessibility": {
      "tool": "WCAG 2.1",
      "features": ["ARIA labels", "keyboard navigation", "screen reader"],
      "validation": "Lighthouse 통합"
    },
    "responsive": {
      "breakpoints": ["mobile", "tablet", "desktop"],
      "testing": "다양한 해상도 테스트",
      "optimization": "TailwindCSS 반응형 디자인"
    }
  }
}
```

### 성능 모니터링 기술

```json
{
  "performance_monitoring": {
    "api": {
      "metrics": ["response_time", "throughput", "error_rate"],
      "tools": ["Express middleware", "Docker stats"],
      "collection": "실시간 데이터 수집",
      "alerting": "임계값 초과 시 알림"
    },
    "frontend": {
      "metrics": ["first_contentful_paint", "largest_contentful_paint", "interaction_to_next_paint"],
      "tools": ["Vite", "React DevTools"],
      "optimization": ["code_splitting", "lazy_loading", "caching"]
    },
    "database": {
      "metrics": ["query_time", "connection_pool", "index_usage"],
      "tools": ["MongoDB profiler", "Mongoose middleware"],
      "optimization": ["indexing", "query_optimization"]
    }
  }
}
```

### 로깅 및 추적 기술

```json
{
  "logging_tracing": {
    "structured": {
      "format": "JSON",
      "fields": ["timestamp", "level", "message", "service", "request_id"],
      "retention": {"development": "7d", "production": "90d"}
    },
    "aggregation": {
      "tools": ["ELK Stack (optional)", "Docker logging"],
      "collection": "중앙 집중적 로그 수집",
      "analysis": "패턴 분석 및 알림"
    },
    "error_tracking": {
      "tools": ["Winston error handlers"],
      "alerting": "에러 발생 시 실시간 알림",
      "recovery": "자동 복구 메커니즘"
    }
  }
}
```

## @DOC:DEPLOY-001 릴리스 채널 및 전략

### 1. 배포 채널

- **주요 채널**: Docker Compose (개발), Docker Compose (프로덕션)
- **배포 절차**: 빌드 → 테스트 → 컨테이너화 → 배포
- **버전 관리**: 시맨틱 버저닝 (Semantic Versioning)
- **롤백 전략**: 이전 버전 Docker 이미지 유지, 즉시 롤백 가능

### 2. 컨테이너화 전략

```yaml
# Docker Compose 구조 (개발 환경)
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports: ["5173:5173"]
    volumes: ["./frontend/src:/app/src", "/app/node_modules"]
    environment: ["VITE_API_URL=http://localhost:5000"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173"]
      interval: 30s
      timeout: 10s
      retries: 3
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports: ["5000:5000"]
    environment:
      - "MONGODB_URI=mongodb://mongodb:27017/todo-app"
      - "NODE_ENV=development"
      - "LOG_LEVEL=debug"
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  mongodb:
    image: mongo:7.0
    ports: ["27017:27017"]
    volumes: ["mongodb_data:/data/db"]
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 5
```

### 3. 프로덕션 배포 인프라 기술 사양

```json
{
  "production_infrastructure": {
    "frontend": {
      "technology": "React 19.1.1 + Vite 7.1.7",
      "container": "Multi-stage Docker build",
      "reverse_proxy": "Nginx 1.25+",
      "features": [
        "Gzip compression",
        "Browser caching",
        "HTTPS redirect",
        "Security headers",
        "Static file serving"
      ],
      "performance": {
        "build_optimization": "Code splitting, tree shaking",
        "cdn_integration": "Cloudflare support",
        "caching_strategy": "Browser + CDN caching"
      }
    },
    "backend": {
      "technology": "Node.js 20.x LTS + Express 5.1.0",
      "container": "Multi-stage build + Alpine Linux",
      "scaling": "Horizontal auto-scaling",
      "monitoring": "Health check endpoints",
      "features": [
        "Performance monitoring",
        "Structured logging",
        "Error handling",
        "Request validation",
        "Security hardening"
      ]
    },
    "database": {
      "technology": "MongoDB 7.0.x",
      "replication": "Replica set support",
      "backup": "Automated daily backups",
      "monitoring": "Query profiling, performance metrics",
      "storage": "Persistent volumes"
    },
    "infrastructure": {
      "orchestration": "Docker Compose + Kubernetes support",
      "networking": "Service mesh, load balancing",
      "security": "Network policies, TLS encryption",
      "monitoring": "Prometheus + Grafana integration"
    }
  }
}
```

### 4. CI/CD 파이프라인 기술 사양

| 단계 | 도구 | 기술 사양 | 성공 기준 |
| --- | ---- | --------- | --------- |
| **코드 관리** | Git | Git hooks, GitHub Actions | 코드 품질 검사 통과 |
| **빌드** | Docker | Multi-stage build, 이미지 최적화 | 빌드 성공, 이미지 크기 최적화 |
| **테스트** | Jest/Vitest | 95% 커버리지, E2E 테스트 | 모든 테스트 통과 |
| **정적 분석** | ESLint/Prettier | 코드 품질, 포맷팅 표준 | 품질 게이트 통과 |
| **보안** | npm audit, Snyk | 취약점 검사, 보안 스캔 | 중간 이상 취약점 없음 |
| **배포** | Docker Compose | 자동화 배포, 롤아웃 | 배포 성공, 상태 확인 |
| **모니터링** | Health Check | 실시간 상태 모니터링 | 모든 서비스 Healthy |

### 5. 개발자 환경 설정

```bash
# 개발 모드 설정
git clone https://github.com/cyans/todo-app.git
cd todo-app

# 프론트엔드 설정
cd frontend
npm install
cp .env.example .env
npm run dev

# 백엔드 설정
cd ../backend
npm install
cp .env.example .env
npm run dev
```

### 6. CI/CD 파이프라인

| 단계 | 목적 | 도구 | 성공 기준 |
| --- | ---- | ---- | --------- |
| 테스트 | 코드 품질 | GitHub Actions | 모든 테스트 통과 |
| 빌드 | 패키징 | Docker | 빌드 성공 |
| 보안 | 취약점 검사 | npm audit | 중간 이상 취약점 없음 |
| 배포 | 프로덕션 | Docker Compose | 배포 성공 |
| 상태 검사 | 컨테이너 상태 | Health Check | 모든 서비스 healthy |

## 환경 프로필

### 개발 (`dev`)

```bash
export NODE_ENV=development
export LOG_LEVEL=debug
export MONGODB_URI=mongodb://localhost:27017/todo-app-dev
```

### 테스트 (`test`)

```bash
export NODE_ENV=test
export LOG_LEVEL=info
export MONGODB_URI=mongodb://localhost:27017/todo-app-test
```

### 프로덕션 (`production`)

```bash
export NODE_ENV=production
export LOG_LEVEL=warn
export MONGODB_URI=${MONGODB_PROD_URI}
export JWT_SECRET=${JWT_PROD_SECRET}
```

## @CODE:TECH-DEBT-001 기술 부채 관리

### 현재 부채

1. **타입스크립트 미도입** – 우선순위: 높음, 단계적 도입 필요
2. **API 버전 관리 부재** – 우선순위: 중간, v1 API 표준화 필요
3. **실시간 기능 부족** – 우선순위: 낮음, WebSocket 도입 계획

### 개선 계획

- **단기 (1개월)**: API 버전 관리 도입, 테스트 커버리지 98% 향상
- **중기 (3개월)**: 프론트엔드 TypeScript 점진적 도입
- **장기 (6개월+)**: 마이크로서비스 아키텍처 고려, 실시간 기능 도입

## EARS Technical Requirements Guide

### Using EARS for the Stack

Apply EARS patterns when documenting technical decisions and quality gates:

#### Technology Stack EARS Example
```markdown
### Ubiquitous Requirements (Baseline)
- The system shall guarantee TypeScript type safety.
- The system shall provide cross-platform compatibility.

### Event-driven Requirements
- WHEN code is committed, the system shall run tests automatically.
- WHEN a build fails, the system shall notify developers immediately.

### State-driven Requirements
- WHILE in development mode, the system shall offer hot reloading.
- WHILE in production mode, the system shall produce optimized builds.

### Optional Features
- WHERE Docker is available, the system may support container-based deployment.
- WHERE CI/CD is configured, the system may execute automated deployments.

### Constraints
- IF a dependency vulnerability is detected, the system shall halt the build.
- Test coverage shall remain at or above 85%.
- Build time shall not exceed 5 minutes.
```

---

_This technology stack guides tool selection and quality gates when `/alfred:2-run` runs._
