---
id: SPEC-TODO-ADVANCED-001
version: 1.0.0
status: draft
created: 2025-01-12
updated: 2025-01-12
author: @spec-builder
priority: high
category: backend
---

# TodoApp 고급 Todo 기능 확장

## HISTORY

### v1.0.0 (2025-01-12)
- **INITIAL**: TodoApp 고급 기능 확장 SPEC 작성
- **AUTHOR**: @spec-builder
- **FOCUS**: 우선순위, 카테고리, 마감일, 태그 기능 확장

---

## TAG BLOCK

@SPEC:TODO-ADVANCED-001: TodoApp 고급 Todo 기능 확장 구현
@CODE:TODO-ADVANCED-001:MODEL-EXT - Todo 모델 확장 (우선순위, 카테고리, 마감일, 태그)
@CODE:TODO-ADVANCED-001:SCHEMA-EXT - Pydantic 스키마 확장
@CODE:TODO-ADVANCED-001:API-EXT - 고급 Todo API 엔드포인트 구현
@CODE:TODO-ADVANCED-001:CATEGORY - 카테고리 관리 기능
@CODE:TODO-ADVANCED-001:TAG - 태그 관리 기능
@CODE:TODO-ADVANCED-001:FILTER - 고급 필터링 및 검색 기능
@CODE:TODO-ADVANCED-001:TEST-EXT - 확장 기능 TDD 테스트 스위트
@DOC:TODO-ADVANCED-001:API-EXT - 확장 API 문서화

---

## Environment

### 개발 환경
- **기존 환경 호환**: SPEC-BACKEND-API-001 환경 완전 호환
- **Python 버전**: Python 3.11+ (기존과 동일)
- **데이터베이스**: SQLite (개발) / PostgreSQL (프로덕션)

### 확장 의존성
- **기존 FastAPI >= 0.104.0**: 유지 및 확장
- **SQLAlchemy >= 2.0.0**: 확장 모델 지원
- **Pydantic >= 2.4.0**: 확장 스키마 검증
- **추가 의존성**:
  - python-dateutil >= 2.8.0: 날짜 처리
  - alembic >= 1.12.0: 데이터베이스 마이그레이션

### API 확장 정책
- **하위 호환성**: 기존 `/api/todos` 엔드포인트 유지
- **새로운 엔드포인트**: 확장 기능을 위한 추가 경로
- **점진적 확장**: 기존 필드는 옵셔널로 확장

---

## Assumptions

### 기술적 가정
- 기존 TodoApp 백엔드 API가 정상적으로 구현되어 있음
- 데이터베이스 스키마 확장이 가능한 환경임
- 날짜/시간 관련 처리를 위한 timezone 인식이 가능함
- 기존 API 클라이언트와의 호환성이 유지되어야 함

### 비즈니스 가정
- 사용자는 Todo를 카테고리별로 그룹화하여 관리하고 싶어함
- Todo의 중요도를 우선순위로 표현하고 싶어함
- 마감일 관리를 통해 시간적 압박을 관리하고 싶어함
- 태그를 통한 유연한 분류 및 검색을 원함

### 운영 가정
- 기존 Todo 데이터는 null 값으로 확장 필드를 가짐
- 카테고리와 태그는 다대다 관계로 설계됨
- 마감일은 선택 사항이며, 없는 Todo도 존재할 수 있음
- 우선순위는 4단계로 고정됨 (낮음, 보통, 높음, 긴급)

---

## Requirements

### Ubiquitous Requirements (기본 요구사항)
- 시스템은 Todo의 우선순위, 카테고리, 마감일, 태그 기능을 제공해야 함
- 시스템은 기존 API와의 완전한 하위 호환성을 유지해야 함
- 시스템은 확장된 필드에 대한 강력한 데이터 검증을 수행해야 함
- 시스템은 카테고리와 태그의 중복을 허용하지 않아야 함

### Event-driven Requirements (이벤트 기반 요구사항)
- WHEN Todo가 생성될 때, 시스템은 지정된 우선순위와 카테고리를 자동으로 할당해야 함
- WHEN Todo 마감일이 변경될 때, 시스템은 자동으로 알림 상태를 업데이트해야 함
- WHEN 새 카테고리가 생성될 때, 시스템은 고유한 식별자와 생성 시간을 할당해야 함
- WHEN 태그가 할당될 때, 시스템은 태그 사용 횟수를 자동으로 증가시켜야 함
- WHEN Todo 완료 상태가 변경될 때, 시스템은 완료 시간을 기록해야 함

### State-driven Requirements (상태 기반 요구사항)
- WHILE Todo가 마감일을 초과했을 때, 시스템은 'overdue' 상태로 표시해야 함
- WHILE 카테고리에 Todo가 없을 때, 시스템은 카테고리를 비활성화할 수 있음
- WHILE 우선순위가 '긴급'인 Todo가 있을 때, 시스템은 특별한 표시를 제공해야 함
- WHILE API가 필터링 요청을 처리할 때, 시스템은 조합된 필터를 지원해야 함

### Optional Features (선택적 기능)
- WHERE 통계 기능이 활성화된 경우, 시스템은 카테고리별 Todo 개수를 제공할 수 있음
- WHERE 알림 기능이 구현된 경우, 시스템은 마감일 임박 Todo에 대한 알림을 보낼 수 있음
- WHERE 검색 기능이 확장된 경우, 시스템은 태그 기반 전문 검색을 제공할 수 있음

### Constraints (제약 조건)
- 카테고리 이름은 최대 50자로 제한되어야 함
- 태그 이름은 최대 30자로 제한되어야 함
- Todo는 최대 10개의 태그를 가질 수 있음
- 마감일은 오늘 이후의 날짜만 설정할 수 있음 (단, 예외 처리 가능)
- 우선순위 변경은 권한이 있는 사용자만 가능해야 함
- API 응답 시간은 기존 수준(100ms)을 유지해야 함

---

## Specifications

### @CODE:TODO-ADVANCED-001:MODEL-EXT - Todo 모델 확장

#### Todo 모델 확장 필드
```python
class Todo(Base):
    # 기존 필드 유지...
    id, title, description, completed, created_at, updated_at

    # 확장 필드 추가
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.MEDIUM)
    due_date = Column(DateTime, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # 관계 정의
    category = relationship("Category", back_populates="todos")
    tags = relationship("Tag", secondary=todo_tags, back_populates="todos")
```

#### PriorityLevel 열거형
```python
class PriorityLevel(str, Enum):
    LOW = "low"      # 낮음
    MEDIUM = "medium" # 보통
    HIGH = "high"    # 높음
    URGENT = "urgent" # 긴급
```

### @CODE:TODO-ADVANCED-001:CATEGORY - 카테고리 관리

#### Category 모델
```python
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200), nullable=True)
    color = Column(String(7), nullable=True)  # HEX color code
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # 관계
    todos = relationship("Todo", back_populates="category")
```

#### 카테고리 API 엔드포인트
- **POST /api/categories** - 카테고리 생성
- **GET /api/categories** - 카테고리 목록 조회
- **GET /api/categories/{id}** - 특정 카테고리 조회
- **PUT /api/categories/{id}** - 카테고리 수정
- **DELETE /api/categories/{id}** - 카테고리 삭제 (soft delete)

### @CODE:TODO-ADVANCED-001:TAG - 태그 관리

#### Tag 모델 및 다대다 관계
```python
class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), unique=True, nullable=False)
    color = Column(String(7), nullable=True)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계
    todos = relationship("Todo", secondary=todo_tags, back_populates="todos")

# 다대다 연결 테이블
todo_tags = Table(
    'todo_tags',
    Base.metadata,
    Column('todo_id', Integer, ForeignKey('todos.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True),
    Column('created_at', DateTime, default=datetime.utcnow)
)
```

#### 태그 API 엔드포인트
- **POST /api/tags** - 태그 생성
- **GET /api/tags** - 태그 목록 조회 (인기순 정렬)
- **GET /api/tags/{id}** - 특정 태그 조회
- **PUT /api/tags/{id}** - 태그 수정
- **DELETE /api/tags/{id}** - 태그 삭제

### @CODE:TODO-ADVANCED-001:API-EXT - 고급 Todo API 확장

#### 확장된 Todo 엔드포인트
```python
# 기존 /api/todos 엔드포인트 확장
POST /api/todos          # 카테고리, 우선순위, 마감일, 태그 지원
GET /api/todos           # 필터링 파라미터 확장
PUT /api/todos/{id}      # 확장 필드 수정 지원

# 새로운 필터링 엔드포인트
GET /api/todos/filter    # 복합 필터링
GET /api/todos/search    # 전문 검색
GET /api/todos/overdue   # 마감일 초과 Todo
GET /api/todos/upcoming  # 곧 마감될 Todo (7일 이내)
```

#### 필터링 파라미터 확장
```
GET /api/todos?
    category_id=1&           # 카테고리 필터
    priority=high&           # 우선순위 필터
    status=completed&        # 완료 상태 필터
    due_before=2024-01-31&   # 마감일 이전 필터
    due_after=2024-01-01&    # 마감일 이후 필터
    tags=urgent,important&   # 태그 필터 (쉼표 구분)
    sort_by=due_date&        # 정렬 기준
    order=asc                # 정렬 순서
```

### @CODE:TODO-ADVANCED-001:SCHEMA-EXT - Pydantic 스키마 확장

#### 확장된 Todo 스키마
```python
class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[PriorityLevel] = PriorityLevel.MEDIUM
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = []

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: PriorityLevel
    due_date: Optional[datetime]
    category_id: Optional[int]
    category: Optional[CategoryResponse] = None
    tags: List[TagResponse] = []
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    is_overdue: bool = False  # 계산된 필드
```

### @CODE:TODO-ADVANCED-001:FILTER - 고급 필터링 기능

#### 복합 필터링 구현
```python
class TodoFilter(BaseModel):
    category_ids: Optional[List[int]] = None
    priorities: Optional[List[PriorityLevel]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None  # completed, pending, overdue
    due_before: Optional[datetime] = None
    due_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    created_after: Optional[datetime] = None
    search_text: Optional[str] = None
```

#### 통계 및 분석 엔드포인트
- **GET /api/todos/stats/overview** - Todo 개요 통계
- **GET /api/todos/stats/categories** - 카테고리별 통계
- **GET /api/todos/stats/priorities** - 우선순위별 통계
- **GET /api/todos/stats/completion** - 완료율 통계

### @CODE:TODO-ADVANCED-001:TEST-EXT - 확장 기능 TDD 테스트

#### 필수 테스트 케이스
1. **우선순위 기능 테스트**
   - 우선순위별 Todo 생성 및 조회
   - 우선순위 정렬 기능 검증
   - 유효하지 않은 우선순위 처리

2. **카테고리 기능 테스트**
   - 카테고리 생성 및 Todo 할당
   - 카테고리별 필터링
   - 중복 카테고리 처리

3. **마감일 기능 테스트**
   - 마감일 설정 및 상태 관리
   - overdue 상태 자동 전환
   - 마감일 기반 정렬

4. **태그 기능 테스트**
   - 태그 생성 및 Todo 할당
   - 다중 태그 검색
   - 태그 사용 통계

5. **통합 필터링 테스트**
   - 복합 조건 필터링
   - 성능 테스트 (대량 데이터)
   - 정렬 및 페이징

### @DOC:TODO-ADVANCED-001:API-EXT - 확장 API 문서화

#### 문서화 요구사항
- 모든 새로운 엔드포인트에 대한 상세 설명
- 확장된 필드의 사용 예시 포함
- 필터링 파라미터 조합 예시
- 에러 응답 상세 설명
- 성능 가이드라인 포함

---

## Traceability

### TAG 연결 체인
```
@SPEC:TODO-ADVANCED-001
├── @TEST:TODO-ADVANCED-001:MODEL - 확장 모델 테스트
├── @TEST:TODO-ADVANCED-001:CATEGORY - 카테고리 기능 테스트
├── @TEST:TODO-ADVANCED-001:TAG - 태그 기능 테스트
├── @TEST:TODO-ADVANCED-001:FILTER - 필터링 기능 테스트
├── @CODE:TODO-ADVANCED-001:MODEL-EXT - Todo 모델 확장 ✅
├── @CODE:TODO-ADVANCED-001:SCHEMA-EXT - Pydantic 스키마 확장 ✅
├── @CODE:TODO-ADVANCED-001:API-EXT - 고급 Todo API 엔드포인트 ✅
├── @CODE:TODO-ADVANCED-001:CATEGORY - 카테고리 관리 기능 ✅
├── @CODE:TODO-ADVANCED-001:TAG - 태그 관리 기능 ✅
├── @CODE:TODO-ADVANCED-001:FILTER - 고급 필터링 기능 ✅
└── @DOC:TODO-ADVANCED-001:API-EXT - 확장 API 문서화 ✅
```

### 기존 SPEC과의 통합
- **@SPEC:BACKEND-API-001**: 기존 기술 스택 완전 활용
- **하위 호환성**: 기존 API 엔드포인트 유지 및 확장
- **데이터베이스**: 기존 테이블 구조 확장 (Alter Table)

### 구현 우선순위
1. **Phase 1**: 데이터 모델 확장 및 마이그레이션
2. **Phase 2**: 카테고리 기능 구현 (독립 기능)
3. **Phase 3**: 태그 기능 구현 (다대다 관계)
4. **Phase 4**: 우선순위 및 마감일 기능
5. **Phase 5**: 통합 필터링 및 검색 기능
6. **Phase 6**: 통계 및 분석 기능

---

### SUMMARY

This SPEC extends the existing TodoApp backend API with advanced todo management features including priority levels, categories, due dates, and tag management. The implementation maintains full backward compatibility with the existing API while adding sophisticated filtering, searching, and organization capabilities. The system will support complex todo management workflows while maintaining performance and data integrity standards established in the base implementation.

---

_이 SPEC은 TodoApp 백엔드 API의 고급 기능 확장을 위한 완전한 기술 사양을 제공합니다. 기존 SPEC-BACKEND-API-001의 성공적인 구현을 바탕으로, 사용자 경험을 크게 향상시킬 수 있는 정교한 Todo 관리 기능들을 TDD 원칙에 따라 구현해야 합니다._