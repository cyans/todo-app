---
id: TECH-001
version: 1.0.0
status: active
created: 2025-11-08
updated: 2025-11-08
author: @project-manager
priority: high
---

# Todo 애플리케이션 기술 스택

## HISTORY

### v1.1.0 (2025-11-10)
- **UPDATED**: UI/UX 향상 및 Docker 배포 시스템 기술 업데이트
- **AUTHOR**: @doc-syncer
- **USER**: GOOS (cyans)
- **LANGUAGE**: 한국어 (ko)
- **STATUS**: TailwindCSS 도입 및 Docker 프로덕션 배포 시스템 추가

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
    build: ./frontend
    ports: ["5173:5173"]
    volumes: ["./frontend/src:/app/src"]
  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment: ["MONGODB_URI=mongodb://localhost:27017/todo-app"]
    depends_on: ["mongodb"]
  mongodb:
    image: mongo:7.0
    ports: ["27017:27017"]
    volumes: ["mongodb_data:/data/db"]
```

```yaml
# Docker Compose 구조 (프로덕션 환경)
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports: ["80:80"]
    depends_on: ["backend"]
  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment: ["NODE_ENV=production"]
    healthcheck: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes: ["./nginx/nginx.conf:/etc/nginx/nginx.conf"]
    depends_on: ["frontend", "backend"]
```

### 3. 개발자 환경 설정

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

### 3. CI/CD 파이프라인

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
