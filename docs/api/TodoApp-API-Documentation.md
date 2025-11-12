# TodoApp API 문서화

**문서 버전**: 1.0.0
**작성일**: 2025-11-11
**담당자**: doc-syncer agent
**TAG**: `@DOC:BACKEND-API-001:API`

---

## 📋 개요

이 문서는 TodoApp 백엔드 API의 완전한 문서화를 제공합니다. FastAPI 기반으로 구현된 RESTful API로, Todo 항목의 생성, 조회, 수정, 삭제 기능을 제공합니다.

@CODE:BACKEND-API-001:MAIN, @CODE:BACKEND-API-001:MODEL, @CODE:BACKEND-API-001:SCHEMA, @CODE:BACKEND-API-001:API, @CODE:BACKEND-API-001:DB 구현을 기반으로 합니다.

---

## 🏗️ 아키텍처

### 구조 다이어그램
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI App   │    │   SQLAlchemy    │    │   Pydantic      │
│   (app.py)      │◄──►│    (model.py)   │◄──►│   (schema.py)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Routers       │    │   Database      │    │   Validation    │
│   (todos.py)    │    │   (todos.db)    │    │   & Response    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 주요 컴포넌트

#### 1. @CODE:BACKEND-API-001:MAIN - 메인 애플리케이션
- **경로**: `backend/src/app/core/app.py`
- **역할**: FastAPI 애플리케이션 핵심 설정
- **기능**: 라우터 포함, CORS 설정, 루트 엔드포인트 제공

#### 2. @CODE:BACKEND-API-001:MODEL - 데이터 모델
- **경로**: `backend/src/app/model.py`
- **역할**: SQLAlchemy ORM 모델 정의
- **기능**: Todo 테이블 구조 및 관계 정의

#### 3. @CODE:BACKEND-API-001:SCHEMA - 데이터 검증 스키마
- **경로**: `backend/src/app/schema.py`
- **역할**: Pydantic 모델 정의
- **기능**: 요청/응답 데이터 검증 및 직렬화

#### 4. @CODE:BACKEND-API-001:API - REST API 엔드포인트
- **경로**: `backend/src/app/routers/todos.py`
- **역할**: CRUD API 엔드포인트 구현
- **기능**: HTTP 요청 처리, 비즈니스 로직 수행

#### 5. @CODE:BACKEND-API-001:DB - 데이터베이스 설정
- **경로**: `backend/src/app/database.py`
- **역할**: 데이터베이스 연결 관리
- **기능**: 세션 관리, 테이블 생성/삭제

---

## 🔌 API 엔드포인트

### 엔드포인트 개요

| 메서드 | 경로 | 설명 | 상태 코드 |
|--------|------|------|-----------|
| `POST` | `/api/todos` | Todo 생성 | 201 Created |
| `GET` | `/api/todos` | 전체 Todo 목록 조회 | 200 OK |
| `GET` | `/api/todos/{todo_id}` | 특정 Todo 조회 | 200 OK / 404 Not Found |
| `PUT` | `/api/todos/{todo_id}` | Todo 수정 | 200 OK / 404 Not Found |
| `DELETE` | `/api/todos/{todo_id}` | Todo 삭제 | 204 No Content / 404 Not Found |

---

### 1. Todo 생성

**`POST /api/todos`**

#### 요청
```json
{
  "title": "새로운 할 일",
  "description": "할 일 상세 설명"
}
```

#### 응답 (201 Created)
```json
{
  "id": 1,
  "title": "새로운 할 일",
  "description": "할 일 상세 설명",
  "completed": false,
  "created_at": "2025-11-11T00:00:00.000000",
  "updated_at": "2025-11-11T00:00:00.000000"
}
```

#### 설명
- 새로운 Todo 항목을 생성합니다.
- 제목은 1-200자 사이어야 하며, 필수 항목입니다.
- 설명은 최대 1000자까지 선택적으로 입력할 수 있습니다.
- 중복된 제목으로 생성 시 400 Bad Error가 발생합니다.

---

### 2. 전체 Todo 목록 조회

**`GET /api/todos`**

#### 요청 쿼리 파라미터
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `skip` | int | 0 | 건너뛰는 항목 수 |
| `limit` | int | 100 | 최대 반환 항목 수 (최대 1000) |

#### 응답 (200 OK)
```json
{
  "todos": [
    {
      "id": 1,
      "title": "할 일 1",
      "description": "설명 1",
      "completed": false,
      "created_at": "2025-11-11T00:00:00.000000",
      "updated_at": "2025-11-11T00:00:00.000000"
    },
    {
      "id": 2,
      "title": "할 일 2",
      "description": "설명 2",
      "completed": true,
      "created_at": "2025-11-11T00:00:00.000000",
      "updated_at": "2025-11-11T00:00:00.000000"
    }
  ],
  "total": 2,
  "skip": 0,
  "limit": 100
}
```

#### 설명
- 모든 Todo 항목을 페이지네이션하여 조회합니다.
- `skip`과 `limit` 파라미터를 사용하여 페이징을 구현합니다.
- `limit`은 최대 1000으로 제한됩니다.

---

### 3. 특정 Todo 조회

**`GET /api/todos/{todo_id}`**

#### 응답 (200 OK)
```json
{
  "id": 1,
  "title": "특정 할 일",
  "description": "설명",
  "completed": false,
  "created_at": "2025-11-11T00:00:00.000000",
  "updated_at": "2025-11-11T00:00:00.000000"
}
```

#### 응답 (404 Not Found)
```json
{
  "detail": "Todo with id 999 not found"
}
```

#### 설명
- 지정된 ID의 Todo 항목을 조회합니다.
- 존재하지 않는 ID 요청 시 404 오류를 반환합니다.

---

### 4. Todo 수정

**`PUT /api/todos/{todo_id}`**

#### 요청
```json
{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "completed": true
}
```

#### 응답 (200 OK)
```json
{
  "id": 1,
  "title": "수정된 제목",
  "description": "수정된 설명",
  "completed": true,
  "created_at": "2025-11-11T00:00:00.000000",
  "updated_at": "2025-11-11T00:00:00.000000"
}
```

#### 응답 (404 Not Found)
```json
{
  "detail": "Todo with id 999 not found"
}
```

#### 설명
- 지정된 ID의 Todo 항목을 수정합니다.
- 일부 필드만 제공 시 해당 필드만 업데이트됩니다.
- 존재하지 않는 ID 요청 시 404 오류를 반환합니다.

---

### 5. Todo 삭제

**`DELETE /api/todos/{todo_id}`**

#### 응답 (204 No Content)
```
(빈 응답 본문)
```

#### 응답 (404 Not Found)
```json
{
  "detail": "Todo with id 999 not found"
}
```

#### 설명
- 지정된 ID의 Todo 항목을 삭제합니다.
- 성공 시 204 상태 코드와 본문 없이 응답합니다.
- 존재하지 않는 ID 요청 시 404 오류를 반환합니다.

---

## 📊 데이터 모델

### @CODE:BACKEND-API-001:MODEL - Todo 모델
```python
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(1000), nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### @CODE:BACKEND-API-001:SCHEMA - Pydantic 스키마

#### TodoCreate (요청 스키마)
```python
class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
```

#### TodoUpdate (수정 스키마)
```python
class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = Field(False)
```

#### TodoResponse (응답 스키마)
```python
class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime
```

#### TodoList (목록 응답 스키마)
```python
class TodoList(BaseModel):
    todos: List[TodoResponse]
    total: int
    skip: int
    limit: int
```

---

## 🔧 에러 처리

### 상태 코드
- **200 OK**: 요청 성공
- **201 Created**: 리소스 생성 성공
- **204 No Content**: 리소스 삭제 성공
- **400 Bad Request**: 잘못된 요청 데이터
- **422 Unprocessable Entity**: 데이터 유효성 검사 실패
- **404 Not Found**: 요청한 리소스가 존재하지 않음

### 에러 응답 형식
```json
{
  "detail": "오류 메시지"
}
```

### 주요 에러 시나리오
1. **제목 누락**: `POST /api/todos` without title
2. **제목 길이 초과**: `POST /api/todos` with title > 200 chars
3. **중복 제목**: `POST /api/todos` with duplicate title
4. **존재하지 않는 ID**: `GET /api/todos/999`
5. **유효하지 않은 파라미터**: `GET /api/todos?limit=1001`

---

## 🛠️ 실행 방법

### 개발 환경에서 실행
```bash
# backend 디렉토리로 이동
cd backend

# FastAPI 애플리케이션 실행
python -m uvicorn src.app.core.app:app --reload --host 0.0.0.0 --port 8000
```

### API 문서 접속
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🧪 테스트

### @TEST:BACKEND-API-001 테스트 스위트
테스트는 `backend/src/tests/` 디렉토리에 위치합니다:

#### 테스트 파일
- `test_api.py`: API 엔드포인트 통합 테스트
- `test_model.py`: 데이터 모덐 단위 테스트
- `test_schema.py`: Pydantic 스키마 유효성 테스트

#### 테스트 실행
```bash
# pytest로 모든 테스트 실행
pytest src/tests/

# 특정 테스트 파일 실행
pytest src/tests/test_api.py
```

---

## 🔒 보안

### 데이터 검증
- 모든 입력 데이터는 Pydantic 스키마를 통한 검증
- SQL 인젝션 방지를 위한 ORM 사용
- 길이 제한을 통한 무한 입력 방지

### 데이터베이스 보안
- 개발 환경: SQLite (파일 기반)
- 프로덕션 환경: PostgreSQL 지원
- 연결 풀링 및 세션 관리

---

## 🚀 배포

### 의존성
- FastAPI >= 0.104.0
- SQLAlchemy >= 2.0.0
- Pydantic >= 2.4.0
- Uvicorn >= 0.23.0

### 환경 변수
```bash
DATABASE_URL=postgresql://user:password@localhost/todo_db
```

---

## 🔄 업데이트 기록

### v1.0.0 (2025-11-11)
- 초기 버전 출시
- @TEST:BACKEND-API-001 테스트 스위트 완성
- 완전한 CRUD 기능 구현
- 자동 API 문서화 지원

---

## 📝 개선 계획

### 단기 계획
- [ ] 사용자 인증 시스템 추가
- [ ] 실시간 알림 기능
- [ ] 배치 처리 기능

### 중기 계획
- [ ] REST API → GraphQL 전환
- [ ] 캐싱 시스템 도입
- [ ] 분석 기능 추가

### 장기 계획
- [ ] 마이크로서비스 아키텍처 전환
- [ ] 다국어 지원
- [ ] 모바일 API 확장

---

**문서 관리**: 이 문서는 @TEST:BACKEND-API-001 테스트 스위트와 함께 유지관리되며, 코드 변경 시 자동으로 업데이트됩니다.