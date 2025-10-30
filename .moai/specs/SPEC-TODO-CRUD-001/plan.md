---
id: TODO-CRUD-001-PLAN
title: 할 일 CRUD 기능 구현 계획
version: 0.0.1
status: draft
priority: high
author: @spec-builder
created: 2025-10-30
---

# 할 일 CRUD 기능 구현 계획

> **SPEC 참조**: `@SPEC:TODO-CRUD-001`
> **목적**: TDD 방식으로 할 일 CRUD 기능을 단계적으로 구현

---

## 구현 전략 개요

### 접근 방식
1. **RED-GREEN-REFACTOR 사이클**: 각 기능을 테스트 → 구현 → 리팩토링 순서로 진행
2. **Outside-In TDD**: API 레이어부터 시작하여 내부 도메인으로 진행
3. **단계별 완성도**: 각 마일스톤마다 작동 가능한 기능 단위를 완성

### 아키텍처 레이어

```
Frontend (UI)
    ↓
API Layer (Controller/Resolver)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (Data Storage)
```

---

## 마일스톤 및 구현 순서

### Phase 1: 기초 인프라 구축 (Foundation)

**목표**: 프로젝트 구조 및 테스트 환경 설정

#### 작업 항목
1. **프로젝트 구조 생성**
   - `src/models/` - 데이터 모델 정의
   - `src/services/` - 비즈니스 로직
   - `src/api/` - API 엔드포인트
   - `src/components/` - UI 컴포넌트
   - `tests/` - 테스트 파일

2. **테스트 환경 설정**
   - 테스트 프레임워크 설치 (Jest, Vitest 등)
   - 테스트 데이터베이스 설정 (In-Memory DB 또는 Test DB)
   - 목(Mock) 설정

3. **데이터 모델 정의**
   - `Todo` 인터페이스/타입 정의
   - 유효성 검사 스키마 (Zod, Yup 등)

**완료 기준**:
- ✅ 프로젝트 디렉토리 구조 생성 완료
- ✅ 테스트 실행 환경 구축 (빈 테스트 실행 가능)
- ✅ `Todo` 타입 정의 완료

---

### Phase 2: 할 일 생성 (Create)

**목표**: POST /api/todos 엔드포인트 구현 (TDD)

#### 우선순위: High

#### TDD 사이클

**🔴 RED: 테스트 작성**
```typescript
// tests/todo-crud.test.ts
// @TEST:TODO-CRUD-001:CREATE

describe('POST /api/todos', () => {
  it('유효한 데이터로 할 일 생성 성공', async () => {
    const newTodo = {
      title: '장보기',
      description: '우유, 빵, 계란 구매',
      priority: 'high'
    };

    const response = await request(app)
      .post('/api/todos')
      .send(newTodo)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      title: '장보기',
      priority: 'high',
      createdAt: expect.any(String)
    });
  });

  it('빈 제목으로 할 일 생성 실패 (400)', async () => {
    const invalidTodo = {
      title: '',
      priority: 'medium'
    };

    const response = await request(app)
      .post('/api/todos')
      .send(invalidTodo)
      .expect(400);

    expect(response.body.error).toContain('제목을 입력해주세요');
  });
});
```

**🟢 GREEN: 최소 구현**
1. `src/api/todo.ts` - POST 엔드포인트 생성
2. `src/services/todo-service.ts` - `createTodo()` 메서드 구현
3. `src/models/todo.ts` - 유효성 검사 로직 추가

**🔵 REFACTOR: 코드 개선**
- 중복 코드 제거
- 에러 핸들링 일관성 확보
- 유효성 검사 로직 분리

**완료 기준**:
- ✅ 테스트 통과 (커버리지 ≥90%)
- ✅ API 문서 업데이트 (`@DOC:TODO-CRUD-001:CREATE`)
- ✅ Git 커밋: `feat(todo): implement create todo endpoint`

---

### Phase 3: 할 일 조회 (Read)

**목표**: GET /api/todos, GET /api/todos/:id 엔드포인트 구현

#### 우선순위: High

#### TDD 사이클

**🔴 RED: 테스트 작성**
```typescript
// @TEST:TODO-CRUD-001:READ

describe('GET /api/todos', () => {
  beforeEach(async () => {
    // 테스트 데이터 세팅
    await createTestTodos([
      { title: 'Todo 1', priority: 'high' },
      { title: 'Todo 2', priority: 'medium' }
    ]);
  });

  it('모든 할 일 목록 조회 성공', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(200);

    expect(response.body.todos).toHaveLength(2);
    expect(response.body.total).toBe(2);
  });

  it('빈 목록 조회 시 빈 배열 반환', async () => {
    await clearTestTodos();

    const response = await request(app)
      .get('/api/todos')
      .expect(200);

    expect(response.body.todos).toEqual([]);
    expect(response.body.total).toBe(0);
  });
});

describe('GET /api/todos/:id', () => {
  it('특정 할 일 상세 조회 성공', async () => {
    const todo = await createTestTodo({ title: 'Test Todo' });

    const response = await request(app)
      .get(`/api/todos/${todo.id}`)
      .expect(200);

    expect(response.body.id).toBe(todo.id);
    expect(response.body.title).toBe('Test Todo');
  });

  it('존재하지 않는 ID 조회 시 404 반환', async () => {
    const response = await request(app)
      .get('/api/todos/non-existent-id')
      .expect(404);

    expect(response.body.error).toContain('찾을 수 없습니다');
  });
});
```

**🟢 GREEN: 최소 구현**
1. `src/api/todo.ts` - GET 엔드포인트 2개 추가
2. `src/services/todo-service.ts` - `getAllTodos()`, `getTodoById()` 구현

**🔵 REFACTOR: 코드 개선**
- 쿼리 최적화
- 에러 메시지 표준화

**완료 기준**:
- ✅ 테스트 통과
- ✅ Git 커밋: `feat(todo): implement read todo endpoints`

---

### Phase 4: 할 일 수정 (Update)

**목표**: PUT /api/todos/:id 엔드포인트 구현

#### 우선순위: High

#### TDD 사이클

**🔴 RED: 테스트 작성**
```typescript
// @TEST:TODO-CRUD-001:UPDATE

describe('PUT /api/todos/:id', () => {
  it('할 일 수정 성공', async () => {
    const todo = await createTestTodo({ title: '장보기', priority: 'high' });

    const updatedData = {
      title: '장보기 완료',
      priority: 'medium'
    };

    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.title).toBe('장보기 완료');
    expect(response.body.priority).toBe('medium');
    expect(response.body.updatedAt).not.toBe(todo.updatedAt);
  });

  it('존재하지 않는 ID 수정 시 404 반환', async () => {
    const response = await request(app)
      .put('/api/todos/non-existent-id')
      .send({ title: 'Updated' })
      .expect(404);
  });

  it('빈 제목으로 수정 시 400 반환', async () => {
    const todo = await createTestTodo({ title: 'Test' });

    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ title: '' })
      .expect(400);
  });
});
```

**🟢 GREEN: 최소 구현**
1. `src/api/todo.ts` - PUT 엔드포인트 추가
2. `src/services/todo-service.ts` - `updateTodo()` 구현
3. `updatedAt` 필드 자동 갱신 로직

**🔵 REFACTOR: 코드 개선**
- 부분 업데이트 로직 최적화
- 변경 사항 추적 로직 추가

**완료 기준**:
- ✅ 테스트 통과
- ✅ Git 커밋: `feat(todo): implement update todo endpoint`

---

### Phase 5: 할 일 삭제 (Delete)

**목표**: DELETE /api/todos/:id 엔드포인트 구현

#### 우선순위: High

#### TDD 사이클

**🔴 RED: 테스트 작성**
```typescript
// @TEST:TODO-CRUD-001:DELETE

describe('DELETE /api/todos/:id', () => {
  it('할 일 삭제 성공', async () => {
    const todo = await createTestTodo({ title: 'Test Todo' });

    await request(app)
      .delete(`/api/todos/${todo.id}`)
      .expect(204);

    // 삭제 확인
    const response = await request(app)
      .get(`/api/todos/${todo.id}`)
      .expect(404);
  });

  it('존재하지 않는 ID 삭제 시 404 반환', async () => {
    const response = await request(app)
      .delete('/api/todos/non-existent-id')
      .expect(404);
  });

  it('삭제 후 목록에서 제거 확인', async () => {
    const todo1 = await createTestTodo({ title: 'Todo 1' });
    const todo2 = await createTestTodo({ title: 'Todo 2' });

    await request(app).delete(`/api/todos/${todo1.id}`).expect(204);

    const response = await request(app).get('/api/todos').expect(200);
    expect(response.body.todos).toHaveLength(1);
    expect(response.body.todos[0].id).toBe(todo2.id);
  });
});
```

**🟢 GREEN: 최소 구현**
1. `src/api/todo.ts` - DELETE 엔드포인트 추가
2. `src/services/todo-service.ts` - `deleteTodo()` 구현

**🔵 REFACTOR: 코드 개선**
- 삭제 확인 로직 추가 (선택 사항)
- Soft Delete 고려 (향후 확장)

**완료 기준**:
- ✅ 테스트 통과
- ✅ Git 커밋: `feat(todo): implement delete todo endpoint`

---

### Phase 6: UI 컴포넌트 구현

**목표**: Frontend 컴포넌트 및 API 통합

#### 우선순위: Medium

#### 작업 항목

1. **TodoList 컴포넌트**
   - 할 일 목록 렌더링
   - 빈 목록 메시지 표시
   - 로딩 상태 처리

2. **TodoForm 컴포넌트**
   - 제목, 설명, 우선순위 입력 필드
   - 실시간 유효성 검사
   - 생성/수정 모드 전환

3. **TodoItem 컴포넌트**
   - 개별 할 일 카드
   - 수정/삭제 버튼
   - 우선순위 뱃지

4. **API 통합**
   - Fetch 또는 Axios를 사용한 API 호출
   - 에러 핸들링
   - 상태 관리 (React Context, Zustand, Redux 등)

**TDD 접근**:
- React Testing Library로 컴포넌트 테스트 작성
- MSW(Mock Service Worker)로 API 목킹

**완료 기준**:
- ✅ 모든 CRUD 기능이 UI에서 작동
- ✅ 컴포넌트 테스트 커버리지 ≥80%
- ✅ Git 커밋: `feat(ui): implement todo CRUD components`

---

### Phase 7: 통합 테스트 및 검증

**목표**: End-to-End 테스트 및 품질 검증

#### 우선순위: High

#### 작업 항목

1. **E2E 테스트 작성**
   - Playwright 또는 Cypress 사용
   - 전체 사용자 흐름 검증

2. **성능 테스트**
   - API 응답 시간 측정 (목표: 200ms 이하)
   - UI 렌더링 시간 측정 (목표: 1초 이내)

3. **보안 검증**
   - SQL Injection 테스트
   - XSS 공격 시뮬레이션
   - OWASP Top 10 체크리스트

4. **접근성 테스트**
   - axe-core 또는 Lighthouse 사용
   - WCAG 2.1 Level AA 준수 확인

**완료 기준**:
- ✅ E2E 테스트 통과
- ✅ 성능 목표 달성
- ✅ 보안 취약점 0건
- ✅ 접근성 점수 ≥90점

---

## 기술 접근 방식

### 테스트 전략

#### 단위 테스트 (Unit Tests)
- **대상**: Service Layer, Utility Functions
- **도구**: Jest, Vitest
- **커버리지 목표**: ≥90%

#### 통합 테스트 (Integration Tests)
- **대상**: API Endpoints
- **도구**: Supertest
- **커버리지 목표**: 모든 엔드포인트 100%

#### E2E 테스트 (End-to-End Tests)
- **대상**: 사용자 시나리오
- **도구**: Playwright, Cypress
- **커버리지 목표**: 주요 플로우 100%

### 에러 핸들링 전략

```typescript
// 표준 에러 응답 형식
interface ErrorResponse {
  error: string;      // 사용자에게 표시할 메시지
  code: string;       // 에러 코드 (예: TODO_NOT_FOUND)
  details?: any;      // 추가 디버깅 정보
}
```

**HTTP 상태 코드 사용**:
- `200 OK`: 성공 (GET, PUT)
- `201 Created`: 생성 성공 (POST)
- `204 No Content`: 삭제 성공 (DELETE)
- `400 Bad Request`: 유효하지 않은 입력
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

### 데이터 유효성 검사

```typescript
// Zod 스키마 예시
import { z } from 'zod';

const TodoSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이내로 입력해주세요.'),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});
```

---

## 위험 및 대응 계획

### 위험 요소

1. **데이터 손실 위험**
   - **설명**: 삭제 기능 실행 시 실수로 인한 영구 손실
   - **대응**: Soft Delete 패턴 고려 (삭제 플래그 추가)

2. **동시성 충돌**
   - **설명**: 여러 사용자가 동일 할 일을 동시에 수정
   - **대응**: 낙관적 잠금(Optimistic Locking) 또는 버전 필드 추가

3. **성능 저하**
   - **설명**: 할 일 개수가 많아지면 목록 조회 속도 저하
   - **대응**: 페이지네이션 구현, 인덱스 최적화

### 기술 부채 방지

1. **코드 리뷰**: 각 Phase 완료 후 코드 리뷰 수행
2. **리팩토링**: 중복 코드 발견 시 즉시 리팩토링
3. **문서화**: API 명세 및 코드 주석 실시간 업데이트

---

## 산출물 체크리스트

### 코드
- ✅ `src/models/todo.ts` - Todo 타입 및 스키마
- ✅ `src/services/todo-service.ts` - CRUD 비즈니스 로직
- ✅ `src/api/todo.ts` - RESTful API 엔드포인트
- ✅ `src/components/TodoList.tsx` - 목록 컴포넌트
- ✅ `src/components/TodoForm.tsx` - 입력 폼 컴포넌트
- ✅ `src/components/TodoItem.tsx` - 개별 아이템 컴포넌트

### 테스트
- ✅ `tests/todo-crud.test.ts` - API 통합 테스트
- ✅ `tests/todo-service.test.ts` - Service 단위 테스트
- ✅ `tests/components/Todo*.test.tsx` - 컴포넌트 테스트
- ✅ `tests/e2e/todo-crud.spec.ts` - E2E 테스트

### 문서
- ✅ `docs/features/todo-crud.md` - 기능 상세 문서
- ✅ `docs/api/todo-endpoints.md` - API 명세서
- ✅ `.moai/specs/SPEC-TODO-CRUD-001/acceptance.md` - 인수 기준 문서

---

## Git 커밋 전략

### 브랜치 전략
- **Feature Branch**: `feature/TODO-CRUD-001`
- **Main Branch**: `main`

### 커밋 메시지 컨벤션

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**타입**:
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `test`: 테스트 추가/수정
- `refactor`: 코드 리팩토링
- `docs`: 문서 업데이트

**예시**:
```
feat(todo): implement create todo endpoint

- Add POST /api/todos endpoint
- Implement TodoService.createTodo()
- Add validation with Zod schema

@SPEC:TODO-CRUD-001
@CODE:TODO-CRUD-001:API
```

---

## 다음 단계

1. **Phase 1 착수**: `/alfred:2-run SPEC-TODO-CRUD-001` 실행
2. **TDD 사이클 시작**: 첫 번째 테스트 작성 (할 일 생성)
3. **진행 상황 추적**: 각 Phase 완료 시 이 문서 업데이트
4. **품질 검증**: Phase 7 완료 후 `/alfred:3-sync` 실행

---

**문서 상태**: 초안 (Draft)
**관련 문서**:
- `@SPEC:TODO-CRUD-001` (spec.md)
- `@SPEC:TODO-CRUD-001:ACCEPTANCE` (acceptance.md)
