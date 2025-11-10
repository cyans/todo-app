---
id: STRUCTURE-001
version: 1.1.0
status: active
created: 2025-11-08
updated: 2025-11-10
author: @project-manager
priority: high
---

# Todo 애플리케이션 구조 설계

## HISTORY

### v1.1.0 (2025-11-10)
- **UPDATED**: UI/UX 향상 및 Docker 배포 시스템 구조 업데이트
- **UPDATED**: 고급 컴포넌트 구조 및 모니터링 시스템 추가
- **IMPLEMENTED**: CI/CD 파이프라인 아키텍처, Docker 컨테이너 아키텍처
- **AUTHOR**: @doc-syncer
- **USER**: GOOS (cyans)
- **LANGUAGE**: 한국어 (ko)
- **STATUS**: UI/UX 개선 및 Docker 배포 시스템 추가
- **TAGS**: @CODE:TODO-BACKEND-001 @CODE:TODO-FRONTEND-001 @CODE:TODO-APP-001 @CODE:TODO-SERVICE-001 @CODE:TODO-API-002 @DOC:TODO-API-001 @CODE:TODO-APP-002

### v1.0.0 (2025-11-08)
- **UPDATED**: 프로젝트 아키텍처 분석 및 한국어 문서화
- **AUTHOR**: @project-manager
- **USER**: GOOS (cyans)
- **LANGUAGE**: 한국어 (ko)
- **STATUS**: 기존 Todo 애플리케이션 구조 분석 완료

---

## @DOC:ARCHITECTURE-001 시스템 아키텍처

### 아키텍처 전략

**Todo 애플리케이션은 현대적인 풀스택 아키텍처를 채택하여 성능, 확장성, 유지보수성을 극대화합니다.**

```
Todo 애플리케이션 아키텍처
- 프론트엔드 (React + Vite)          # 사용자 인터페이스 및 상태 관리
- API 레이어 (Express.js)            # 비즈니스 로직 및 라우팅
- 데이터 레이어 (MongoDB)             # 데이터 저장 및 검색
- 인프라 레이어 (Docker)              # 컨테이너화 및 배포
```

**근거**: 각 레이어의 분리를 통해 유지보수성을 높이고, MongoDB의 강력한 검색 기능과 React의 반응형 UI를 결합하여 최적의 사용자 경험 제공

## @DOC:MODULES-001 모듈 책임

### 1. 프론트엔드 모듈 (Frontend)

- **책임**: 사용자 인터페이스 제공, 상태 관리, API 통신
- **입력**: 사용자 상호작용, API 응답
- **처리**: 컴포넌트 렌더링, 상태 업데이트, 이벤트 처리
- **출력**: 렌더링된 UI, API 요청

| 컴포넌트 | 역할 | 핵심 기능 |
| --------- | ---- | --------- |
| TodoList | 메인 리스트 | Todo 목록 표시, 가상 스크롤링, 상태 관리 |
| TodoItem | 개별 항목 | 인라인 편집, 마감일 관리, 우선순위 배지 |
| SearchBar | 고급 검색 | 실시간 검색, 음성 입력, 자동완성 |
| TodoForm | 향상된 입력 폼 | flexbox 레이아웃, 검증, 접근성 |
| FilterControls | 필터 | 다차원 필터링, 상태/우선순위 조합 |
| StatusBar | 상태 표시 | 실시간 통계, 개요 표시 |
| Statistics | 통계 | 성능 지표, 사용자 분석 |

### 2. 백엔드 모듈 (Backend)

- **책임**: API 엔드포인트 제공, 데이터 검증, 비즈니스 로직 실행
- **입력**: HTTP 요청, 데이터베이스 쿼리
- **처리**: 요청 검증, 데이터 처리, 비즈니스 규칙 적용
- **출력**: JSON 응답, 데이터베이스 업데이트

| 서비스 | 역할 | 핵심 기능 |
| ------ | ---- | --------- |
| todo-service | 비즈니스 로직 | CRUD operations, 상태 관리 |
| 라우팅 | API 관리 | 엔드포인트 정의, 미들웨어 |
| 미들웨어 | 교차 기능 | 보안, 로깅, 성능 모니터링 |
| 헬스 체크 | 모니터링 | /health, /ready, /live 엔드포인트 |
| 데이터베이스 | 데이터 관리 | MongoDB 연결, 스키마 관리 |
| 통계 서비스 | 분석 | 실시간 성능 지표, 사용자 분석 |
| 검색 서비스 | 검색 | 고급 검색, 음성 처리 |

### 3. 데이터 모듈 (Data)

- **책임**: 데이터 저장, 인덱싱, 검색 최적화
- **입력**: CRUD operations, 검색 쿼리
- **처리**: 데이터 검증, 인덱싱, 히스토리 관리
- **출력**: 쿼리 결과, 성능 최적화

## @DOC:INTEGRATION-001 외부 통합

### MongoDB 통합

- **인증 방식**: 연결 문자열 기반 인증
- **데이터 교환**: BSON 형식, Mongoose ODM 사용
- **장애 처리**: 연결 풀링, 자동 재연결
- **위험 수준**: 중간 - 데이터 백업 전략 필요

### React 통합

- **목적**: 사용자 인터페이스 프레임워크
- **의존도 수준**: 높음 - 핵심 프론트엔드 기술
- **성능 요구사항**: 초기 로드 <3초, 상호작용 <100ms

### Express.js 통합

- **목적**: 백엔드 API 서버 프레임워크
- **의존도 수준**: 높음 - API 레이어의 핵심
- **성능 요구사항**: API 응답 <200ms

## @DOC:DOCKER-001 Docker 컨테이너 아키텍처

### 컨테이너화 전략

**Todo 애플리케이션은 Docker 컨테이너를 통한 완전한 개발/프로덕션 환경을 제공합니다.**

### 개발 환경 컨테이너 구조
```
개발 환경/
├── todo-frontend/         # React 개발 서버 (Port: 5173)
│   ├── Vite 개발 모드    # Hot reload, 개발 도구
│   └── Source Maps      # 디버깅 지원
├── todo-backend/          # Express API 서버 (Port: 5000)
│   ├── Node.js 개발 모드  # 자동 재시작
│   └── 로깅 시스템       # 개발 로그
├── todo-mongodb/          # MongoDB 데이터베이스 (Port: 27017)
│   ├── 데이터 볼륨      # 지속성 저장
│   └── 백업 스케줄      자동 백업
└── 네트워크 오버레이      # 서비스 간 통신
```

### 프로덕션 환경 컨테이너 구조
```
프로덕션 환경/
├── frontend/             # Nginx 리버스 프록시 (Port: 80)
│   ├── 정적 파일 제공     # 빌드된 React 애플리케이션
│   ├── 캐싱 설정         # 성능 최적화
│   └── 보안 헤더         HTTPS, CSP
├── backend/              # Express API 서버
│   ├── 멀티스테이지 빌드  # 이미지 크기 최적화
│   ├── 헬스 체크         /health, /ready, /live
│   └── 로그 집계          구조화된 로깅
├── mongodb/              # MongoDB 데이터베이스
│   ├── 복제 설정         고가용성
│   ├── 백업 전략         정기 백업
│   └── 성능 모니터링     쿼리 분석
└── 로드 밸런서 (선택)   수평적 확장
```

### 컨테이너 관리

**헬스 체크 엔드포인트**:
- **Frontend**: Nginx 기본 헬스 체크
- **Backend**: `/health` → 전체 시스템 상태
- **Database**: MongoDB 연결 상태

**자동 확장**:
- **CPU 사용률 > 80%**: 자동 스케일 아웃
- **메모리 사용률 > 90%**: 자동 스케일 아웃
- **응답 시간 > 1s**: 자로 스케일 아웃

## @DOC:CI-CD-001 CI/CD 파이프라인 아키텍처

### CI/CD 전략

**Todo 애플리케이션은 완전한 CI/CD 파이프라인을 구현하여 자동화된 배포를 지원합니다.**

### 파이프라인 단계
```
CI/CD 파이프라인/
├── 1. 코드 푸시
│   ├── Git Hook 트리거   pre-commit, pre-push
│   └── 빌드 큐          자동 빌드 요청
├── 2. 빌드 단계
│   ├── 프론트엔드 빌드   npm run build → Docker 이미지
│   ├── 백엔드 빌드      npm run build → Docker 이미지
│   └── 테스트 실행      Jest + Vitest → 커버리지 보고서
├── 3. 테스트 단계
│   ├── 단위 테스트      95% 커버리지
│   ├── 통합 테스트      API 엔드포인트
│   ├── E2E 테스트      사용자 시나리오
│   └── 보안 스캔        취약점 분석
├── 4. 배포 단계
│   ├── 스테이징 환경     QA 테스트
│   ├── 프로덕션 배포     자동 롤아웃
│   └── 롤백 메커니즘     자동 복구
└── 5. 모니터링
    ├── 성능 모니터링     응답 시간, 에러율
    ├── 로그 집계        ELK 스택
    └── 알림 시스템      Slack, Email
```

### 배포 전략

**블루-그린 배포**:
- 현재 환경: "Blue" 프로덕션
- 새 환경: "Green" 스테이징
- 전환: DNS 라우팅 전환
- 롤백: 즉시 환경 전환

**카나리 배포**:
- 10% 트래픽 → 새 버전 테스트
- 50% 트래픽 → 안정성 검증
- 100% 트래픽 → 전체 배포
- 모니터링: 실시간 성능 추적

## @DOC:TRACEABILITY-001 추적성 전략

### TAG 프레임워크 적용

**완전한 TDD 정렬**: SPEC → Tests → Implementation → Documentation
- `@SPEC:ID` (`.moai/specs/`) → `@TEST:ID` (`tests/`) → `@CODE:ID` (`src/`) → `@DOC:ID` (`docs/`)

**구현 세부 수준**: `@CODE:ID` 내 주석
- `@CODE:ID:API` – REST API 엔드포인트
- `@CODE:ID:UI` – React 컴포넌트
- `@CODE:ID:DATA` – MongoDB 스키마, 모델
- `@CODE:ID:DOMAIN` – 비즈니스 로직, 규칙
- `@CODE:ID:INFRA` – 데이터베이스, 미들웨어
- `@CODE:ID:DOCKER` – Docker 컨테이너, 헬스 체크
- `@CODE:ID:MONITORING` – 모니터링, 로깅, 성능 추적

### TAG 추적성 관리

- **검증**: `/alfred:3-sync` 실행, `rg '@(SPEC|TEST|CODE|DOC):' -n` 스캔
- **범위**: 전체 프로젝트 소스 (`.moai/specs/`, `tests/`, `src/`, `docs/`)
- **주기**: 코드 변경 시마다 검증
- **코드 우선 원칙**: TAG의 진실은 소스 코드 자체에 존재
- **CI/CD 통합**: 파이프라인 자동 검증 및 배포

## 현재 시스템 스냅샷

### 기존 시스템 구조

**Todo 애플리케이션은 완전히 구현된 풀스택 웹 애플리케이션입니다.**

```
현재 시스템 (v1.2.0)/
├── frontend/              # React 19.1.1 + Vite 7.1.7 + TailwindCSS
│   ├── src/
│   │   ├── components/    # TodoList, TodoItem, SearchBar, StatusBar, Statistics (95% 테스트 커버리지)
│   │   ├── services/      # API 클라이언트, 검색 서비스
│   │   ├── styles/        # TailwindCSS 스타일링, 다크 모드
│   │   ├── hooks/         # useTodos, useSearch, useVoiceSearch
│   │   └── utils/         # 헬퍼 함수, 검증기
│   ├── Dockerfile         # 멀티스테이지 빌드
│   ├── nginx.conf         # Nginx 설정 (프로덕션)
│   ├── .env.production    # 프로덕션 환경 변수
│   └── vite.config.js     # Vite 빌드 설정
├── backend/               # Express 5.1.0 + Node.js 20.x + MongoDB
│   ├── src/
│   │   ├── routes/        # API 엔드포인트 (todo-routes.js, health-routes.js 활성화)
│   │   ├── services/      # 비즈니스 로직 (todo-service.js, stats-service.js)
│   │   ├── middleware/    # 성능 모니터링, 구조화된 로깅, 보안
│   │   ├── config/        # 데이터베이스, 검증
│   │   └── utils/         # 로깅 유틸리티
│   ├── Dockerfile         # 멀티스테이지 빌드
│   ├── healthcheck.js     # 컨테이너 상태 검증
│   ├── .env.example       # 환경 변수 예시
│   └── src/               # 소스 코드 구조화
├── .moai/                 # MoAI-ADK 설정
│   ├── specs/             # SPEC-UI-UX-DEPLOY-005, SPEC-TODO-CRUD-001 등
│   ├── project/           # 프로젝트 문서 (product.md, structure.md, tech.md)
│   └── config.json        # 에이전트 설정
├── tests/                 # E2E 테스트
├── docs/                  # 문서화
├── docker-compose.yml     # 개발 환경 컴포즈
├── docker-compose.prod.yml # 프로덕션 환경 컴포즈
├── nginx/                 # Nginx 설정 파일
└── scripts/               # 배포 스크립트, 모니터링 스크립트
```

### 마이그레이션 고려사항

1. **데이터베이스 스키마 확장** – 우선순위: 높음, 향후 협업 기능 대비
2. **API 버전 관리** – 우선순위: 중간, 하위 호환성 유지
3. **성능 최적화** – 우선순위: 중간, 10,000+ todos 지원

## TODO:STRUCTURE-001 구조적 개선사항

1. **마이크로서비스 아키텍처 고려** – 대규모 확장 시 분리 계획
2. **실시간 통신 레이어** – WebSocket/Server-Sent Events 도입 계획
3. **모바일 아키텍처** – React Native 통합을 위한 API 표준화 계획

## EARS for Architectural Requirements

### Applying EARS to Architecture

Use EARS patterns to write clear architectural requirements:

#### Architectural EARS Example
```markdown
### Ubiquitous Requirements (Baseline Architecture)
- The system shall adopt a layered architecture.
- The system shall maintain loose coupling across modules.

### Event-driven Requirements
- WHEN an external API call fails, the system shall execute fallback logic.
- WHEN a data change event occurs, the system shall notify dependent modules.

### State-driven Requirements
- WHILE the system operates in scale-out mode, it shall load new modules dynamically.
- WHILE in development mode, the system shall provide verbose debug information.

### Optional Features
- WHERE the deployment runs in the cloud, the system may use distributed caching.
- WHERE high performance is required, the system may apply in-memory caching.

### Constraints
- IF the security level is elevated, the system shall encrypt all inter-module communication.
- Each module shall keep cyclomatic complexity under 15.
```

---

_This structure informs the TDD implementation when `/alfred:2-run` runs._
