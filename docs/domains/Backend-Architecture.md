# 백엔드 아키텍처 문서

**문서 버전**: 1.0.0
**작성일**: 2025-11-11
**도메인**: Backend
**TAG**: `@DOC:BACKEND-ARCH-001`

---

## 📋 개요

이 문서는 TodoApp 백엔드 아키텍처에 대한 상세한 설명을 제공합니다. FastAPI 기반의 RESTful API 구조와 데이터 모델, 라우팅 전략을 다룹니다.

@CODE:BACKEND-API-001:MAIN, @CODE:BACKEND-API-001:MODEL, @CODE:BACKEND-API-001:SCHEMA, @CODE:BACKEND-API-001:API, @CODE:BACKEND-API-001:DB 구현을 기반으로 합니다.

---

## 🏗️ 전체 아키텍처

### 아키텍처 다이어그램
```
┌─────────────────────────────────────────────────────────────┐
│                        FastAPI Application                    │
├─────────────────────────────────────────────────────────────┤
│  Root Endpoint (/)                                         │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Todo Router   │  │  Health Router  │                   │
│  │   (/api/todos)  │  │    (/health)    │                   │
│  └─────────────────┘  └─────────────────┘                   │
├─────────────────────────────────────────────────────────────┤
│                     Core Components                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │   Database      │  │   Schemas       │  │   Config        ││
│  │    (SQLite)     │  │   (Pydantic)    │  │   (Settings)    ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 모듈 구조

### src/app/
```
app/
├── __init__.py                 # 패키지 초기화
├── main.py                     # 애플리케이션 진입점
├── config.py                   # 설정 관리
├── database.py                 # 데이터베이스 연결
├── model.py                    # SQLAlchemy 모델
├── schema.py                   # Pydantic 스키마
├── core/
│   ├── __init__.py
│   └── app.py                  # 핵심 FastAPI 설정
└── routers/
    ├── __init__.py
    ├── todos.py                # Todo API 라우터
    └── health.py               # Health check 라우터
```

### 의존성 주입 구조
```python
# main.py → core.app.py → routers.* → database.py → model.py
```

---

## 🔧 핵심 컴포넌트

### 1. @CODE:BACKEND-API-001:MAIN - 메인 애플리케이션

#### app.py 핵심 설정
```python
# FastAPI 애플리케이션 생성
app = FastAPI(
    title="TodoApp API",
    description="Simple Todo Management API",
    version="1.0.0"
)

# 라우터 포함
app.include_router(todos.router, prefix="/api/todos", tags=["Todos"])
app.include_router(health.router, prefix="/health", tags=["Health"])

# 루트 엔드포인트
@app.get("/", tags=["Root"])
async def root():
    return get_root_response()
```

#### 특징
- **자동 문서화**: `/docs`, `/redoc`에서 대화식 문서 제공
- **CORS 지원**: 개발 환경에서 모든 오리진 허용
- **API 버전 관리**: 명확한 버전 정보 제공

### 2. @CODE:BACKEND-API-001:MODEL - 데이터 모델

#### Todo 모델 설계
```python
class Todo(Base):
    __tablename__ = "todos"

    # 필드 정의
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)      # 제목 (필수)
    description = Column(String(1000), nullable=True)  # 설명 (선택)
    completed = Column(Boolean, default=False)        # 완료 상태
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### 설계 원칙
- **ORM 사용**: SQLAlchemy를 통한 데이터베이스 추상화
- **타임스탬프**: 자동 생성 및 업데이트 관리
- **유효성 검증**: 애플리케이션 수준에서 제한 적용

### 3. @CODE:BACKEND-API-001:SCHEMA - 데이터 검증

#### 스키마 계층 구조
```python
# 요청 스키마
TodoCreate     # 생성 요청 (title 필수)
TodoUpdate     # 수정 요청 (일부 필드만 업데이트)

# 응답 스키마
TodoResponse   # 전체 응답 (모든 필드 포함)
TodoList       # 목록 응답 (페이징 정보 포함)
```

#### 검증 규칙
- **제목**: 1-200자, 필수 입력
- **설명**: 최대 1000자, 선택 입력
- **완료 상태**: 기본값 False, Boolean 타입
- **자동 생성**: created_at, updated_at 자동 관리

### 4. @CODE:BACKEND-API-001:API - REST 엔드포인트

#### RESTful API 설계
```python
# CRUD 작업
POST    /api/todos      # Create (201 Created)
GET     /api/todos      # Read (List)
GET     /api/todos/{id} # Read (Single)
PUT     /api/todos/{id} # Update (200 OK)
DELETE  /api/todos/{id} # Delete (204 No Content)
```

#### 상태 코드 전략
- **201**: 리소스 성공 생성
- **200**: 요청 성공 처리
- **204**: 리소스 성공 삭제
- **400**: 요청 데이터 오류
- **422**: 데이터 유효성 검사 실패
- **404**: 요청한 리소스 없음

### 5. @CODE:BACKEND-API-001:DB - 데이터베이스 설정

#### 연결 관리
```python
# 데이터베이스 URL 설정
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")

# 엔진 생성
engine = create_engine(DATABASE_URL)

# 세션 관리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

#### 데이터베이스 특성
- **개발 환경**: SQLite (파일 기반)
- **프로덕션**: PostgreSQL 지원 가능
- **동기/비동기**: SQLAlchemy 2.0 비동기 지원
- **연결 풀링**: 자동 연결 관리

---

## 🔄 라우팅 전략

### 라우터 구조
```
/api/todos/
├── POST     /           # Todo 생성
├── GET      /           # 전체 목록 조회
├── GET      /{id}       # 특정 Todo 조회
├── PUT      /{id}       # Todo 수정
└── DELETE   /{id}       # Todo 삭제

/health/
└── GET      /           # 서버 상태 확인
```

### 의존성 주입
```python
# 데이터베이스 의존성
@app.get("/api/todos")
async def get_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # 데이터베이스 세션 자동 관리
    pass
```

---

## 🛡️ 보안 및 성능

### 보안 대책
- **데이터 검증**: Pydantic을 통한 입력 데이터 검증
- **SQL 인젝션 방지**: ORM 사용으로 자동 방지
- **길이 제한**: 필드 길이 제한으로 무한 입력 방지

### 성능 최적화
- **페이징**: `skip`과 `limit`으로 대량 데이터 처리
- **세션 관리**: 데이터베이스 세션 재사용
- **인덱싱**: 주요 필드에 인덱스 적용

---

## 🧪 테스트 전략

### 테스트 계층
```python
# 단위 테스트 (model.py)
- 데이터 모델 검증
- 필드 유효성 검사

# 통합 테스트 (routers/*.py)
- API 엔드포인트 테스트
- 데이터베이스 연동 테스트

# 스키마 테스트 (schema.py)
- 데이터 직렬화 테스트
- 변환 유효성 테스트
```

### 테스트 데이터베이스
- **인메모리 SQLite**: 테스트용 별도 데이터베이스
- **트랜잭션 관리**: 각 테스트 후 데이터 정리

---

## 📊 모니터링

### 상태 확인
```python
# Health check 엔드포인트
@router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}
```

### 로깅
- **API 요청/응답**: 모든 요청에 대한 로그 기록
- **데이터베이스 작업**: 쿼리 성능 모니터링
- **에러 추적**: 자동 오류 로깅

---

## 🔮 확장성

### 미래 계획
- **Redis 캐싱**: 자주 조회되는 데이터 캐싱
- **API 버전 관리**: 여러 버전 동시 지원
- **비동기 처리**: Celery를 통한 백그라운드 작업

### 아키텍처 진화
- **마이크로서비스**: 단일 서비스 → 여러 서비스 분리
- **컨테이너화**: Docker를 통한 배포 최적화
- **클라우드 지원**: AWS/Azure/GCP 배포 준비

---

## 🎯 사용 가이드

### 개발자 가이드
1. **새 엔드포인트 추가**: 기존 라우터 패턴 참조
2. **데이터 모델 확장**: SQLAlchemy 모델 정의
3. **API 문서**: 자동 생성되므로 주석 작성만으로 문서화

### 배포 가이드
1. **개발 환경**: SQLite 사용 권장
2. **프로덕션**: PostgreSQL로 전환 권장
3. **환경 변수**: `DATABASE_URL` 설정 필수

---

**최종 업데이트**: 2025-11-11
**문서 버전**: v1.0.0
**관리자**: doc-syncer agent