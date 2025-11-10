---
id: API-001
version: 1.1.0
status: active
created: 2025-11-10
updated: 2025-11-10
author: @doc-syncer
priority: high
---

# 🚀 Todo API 문서

## HISTORY

### v1.1.0 (2025-11-10)
- **UPDATED**: 전체 API 문서 생성 및 분석
- **AUTHOR**: @doc-syncer
- **USER**: GOOS (cyans)
- **LANGUAGE**: 한국어 (ko)
- **STATUS**: Todo 애플리케이션 API 전체 문서화 완료

---

## @DOC:API-001 API 개요

### 아키텍처 개요

Todo 애플리케이션 API는 현대적인 RESTful 아키텍처를 채택하여 확장성과 유지보수성을 극대화합니다.

```
API 아키텍처 (v1.1.0)
├── 프레임워크: Express.js 5.1.0 + Node.js 20.x
├── 데이터베이스: MongoDB 7.0.x + Mongoose 8.19.2
├── 보안: Helmet 8.1.0 + CORS 2.8.5
├── 모니터링: 성능 모니터링 미들웨어
└── 로깅: Winston 3.18.3 + 구조화된 로깅
```

### 핵심 특징

- **🔍 RESTful Design**: 표준 REST API 패턴
- **🛡️ 보안 강화**: Helmet, CORS, 입력 검증
- **⚡ 성능 모니터링**: 실시간 성능 추적
- **📊 상태 확인**: 다중 헬스 체크 엔드포인트
- **🔄 상태 추적**: 상태 변경 이력 추적
- **📈 검색 및 필터링**: 고급 검색 및 필터링 기능

---

## 🔗 엔드포인트 목록 (Endpoints)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/todos/health` | API 헬스 체크 |
| `POST` | `/api/todos` | 새로운 Todo 항목 생성 |
| `GET` | `/api/todos` | Todo 목록 조회 (필터링 및 정렬) |
| `GET` | `/api/todos/:id` | 특정 Todo 항목 조회 |
| `PUT` | `/api/todos/:id` | Todo 항목 업데이트 |
| `DELETE` | `/api/todos/:id` | Todo 항목 삭제 |
| `PATCH` | `/api/todos/:id/status` | Todo 상태 업데이트 |
| `GET` | `/api/todos/:id/history` | Todo 상태 이력 조회 |
| `GET` | `/api/todos/search/:query` | Todo 검색 |
| `GET` | `/api/todos/priority/:priority` | 우선순위별 Todo 조회 |
| `GET` | `/api/todos/stats/overview` | Todo 통계 정보 |
| `DELETE` | `/api/todos/cleanup/old` | 오래된 Todo 정리 |

---

## 📝 데이터 모델 (Data Models)

### Todo 객체 구조
```json
{
  "_id": "ObjectId",
  "text": "string",
  "completed": "boolean",
  "priority": "string",
  "status": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "statusHistory": [
    {
      "fromStatus": "string",
      "toStatus": "string",
      "changedAt": "Date"
    }
  ]
}
```

### 필드 설명
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `text` | String | O | Todo 내용 |
| `completed` | Boolean | X | 완료 여부 (deprecated) |
| `priority` | String | X | 우선순위: `low`, `medium`, `high` |
| `status` | String | O | 상태: `pending`, `in_progress`, `completed` |
| `createdAt` | Date | O | 생성 시간 |
| `updatedAt` | Date | O | 수정 시간 |
| `statusHistory` | Array | X | 상태 변경 이력 |

---

## 🚀 엔드포인트 상세 (Endpoint Details)

### 1. 헬스 체크 (Health Check)

**`GET /api/todos/health`**

**설명**: Todo API의 상태를 확인하며 MongoDB 연결 통계와 함께 제공됩니다.

**응답 예시**:
```json
{
  "status": "healthy",
  "message": "Todo API is running",
  "timestamp": "2025-11-10T10:00:00.000Z",
  "data": {
    "total": 10,
    "byStatus": {
      "pending": 5,
      "in_progress": 3,
      "completed": 2
    },
    "byPriority": {
      "high": 3,
      "medium": 5,
      "low": 2
    }
  }
}
```

**상태 엔드포인트 추가**:
- `GET /api/todos/ready` - 서비스 준비 상태 확인
- `GET /api/todos/live` - 서비스 활성 상태 확인
- `GET /api/todos/startup` - 서비스 시작 완료 확인

---

### 2. Todo 생성 (Create Todo)

**`POST /api/todos`**

**요청 본문**:
```json
{
  "text": "새로운 할 일",
  "priority": "high"
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "_id": "658a1b2c3d4e5f6a7b8c9d0e",
    "text": "새로운 할 일",
    "completed": false,
    "priority": "high",
    "status": "pending",
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:00:00.000Z",
    "statusHistory": [
      {
        "fromStatus": null,
        "toStatus": "pending",
        "changedAt": "2025-11-07T10:00:00.000Z"
      }
    ]
  },
  "message": "Todo created successfully",
  "timestamp": "2025-11-07T10:00:00.000Z"
}
```

---

### 3. Todo 목록 조회 (Get Todos)

**`GET /api/todos?filter=all&sortBy=created&page=1&limit=10`**

**쿼리 파라미터**:
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `filter` | String | `all` | 필터: `all`, `active`, `completed` |
| `sortBy` | String | `created` | 정렬: `created`, `priority`, `text` |
| `page` | Number | `1` | 페이지 번호 |
| `limit` | Number | `10` | 페이지 당 항목 수 |

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "658a1b2c3d4e5f6a7b8c9d0e",
      "text": "첫 번째 할 일",
      "completed": false,
      "priority": "high",
      "status": "in_progress",
      "createdAt": "2025-11-07T09:00:00.000Z",
      "updatedAt": "2025-11-07T09:30:00.000Z",
      "statusHistory": [
        {
          "fromStatus": "pending",
          "toStatus": "in_progress",
          "changedAt": "2025-11-07T09:30:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "filter": "active",
  "sortBy": "created",
  "timestamp": "2025-11-07T10:00:00.000Z"
}
```

---

### 4. 단일 Todo 조회 (Get Todo by ID)

**`GET /api/todos/:id`**

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "_id": "658a1b2c3d4e5f6a7b8c9d0e",
    "text": "특정 할 일",
    "completed": false,
    "priority": "medium",
    "status": "pending",
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:00:00.000Z",
    "statusHistory": [
      {
        "fromStatus": null,
        "toStatus": "pending",
        "changedAt": "2025-11-07T10:00:00.000Z"
      }
    ]
  },
  "timestamp": "2025-11-07T10:00:00.000Z"
}
```

---

### 5. Todo 업데이트 (Update Todo)

**`PUT /api/todos/:id`**

**요청 본문**:
```json
{
  "text": "업데이된 할 일 내용",
  "priority": "high",
  "status": "in_progress"
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "_id": "658a1b2c3d4e5f6a7b8c9d0e",
    "text": "업데이된 할 일 내용",
    "completed": false,
    "priority": "high",
    "status": "in_progress",
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:30:00.000Z",
    "statusHistory": [
      {
        "fromStatus": "pending",
        "toStatus": "in_progress",
        "changedAt": "2025-11-07T10:30:00.000Z"
      }
    ]
  },
  "message": "Todo updated successfully",
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

### 6. Todo 삭제 (Delete Todo)

**`DELETE /api/todos/:id`**

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "id": "658a1b2c3d4e5f6a7b8c9d0e"
  },
  "message": "Todo deleted successfully",
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

### 7. Todo 상태 업데이트 (Update Todo Status)

**`PATCH /api/todos/:id/status`**

**요청 본문**:
```json
{
  "status": "completed"
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "_id": "658a1b2c3d4e5f6a7b8c9d0e",
    "text": "완료된 할 일",
    "completed": true,
    "priority": "high",
    "status": "completed",
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:30:00.000Z",
    "statusHistory": [
      {
        "fromStatus": "in_progress",
        "toStatus": "completed",
        "changedAt": "2025-11-07T10:30:00.000Z"
      }
    ]
  },
  "message": "Todo status updated successfully",
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

### 8. Todo 상태 이력 조회 (Get Todo Status History)

**`GET /api/todos/:id/history`**

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "fromStatus": null,
      "toStatus": "pending",
      "changedAt": "2025-11-07T10:00:00.000Z"
    },
    {
      "fromStatus": "pending",
      "toStatus": "in_progress",
      "changedAt": "2025-11-07T10:15:00.000Z"
    },
    {
      "fromStatus": "in_progress",
      "toStatus": "completed",
      "changedAt": "2025-11-07T10:30:00.000Z"
    }
  ],
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

### 9. Todo 검색 (Search Todos)

**`GET /api/todos/search/:query?filter=all&sortBy=created&limit=20`**

**쿼리 파라미터**:
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `query` | String | 필수 | 검색어 |
| `filter` | String | `all` | 필터: `all`, `active`, `completed` |
| `sortBy` | String | `created` | 정렬: `created`, `priority`, `text` |
| `limit` | Number | `20` | 최대 결과 수 |

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "_id": "658a1b2c3d4e5f6a7b8c9d0e",
        "text": "검색 결과 할 일",
        "completed": false,
        "priority": "medium",
        "status": "pending",
        "createdAt": "2025-11-07T10:00:00.000Z",
        "updatedAt": "2025-11-07T10:00:00.000Z"
      }
    ],
    "query": "검색",
    "count": 1
  },
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

### 10. 우선순위별 Todo 조회 (Get Todos by Priority)

**`GET /api/todos/priority/:priority?filter=all`**

**쿼리 파라미터**:
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `priority` | String | 필수 | 우선순위: `low`, `medium`, `high` |
| `filter` | String | `all` | 필터: `all`, `active`, `completed` |

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "_id": "658a1b2c3d4e5f6a7b8c9d0e",
        "text": "높은 우선순위 할 일",
        "completed": false,
        "priority": "high",
        "status": "in_progress",
        "createdAt": "2025-11-07T10:00:00.000Z",
        "updatedAt": "2025-11-07T10:15:00.000Z"
      }
    ],
    "priority": "high",
    "count": 1
  },
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

### 11. Todo 통계 정보 (Get Todo Statistics)

**`GET /api/todos/stats/overview`**

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "completed": 7,
    "active": 18,
    "pending": 10,
    "inProgress": 8,
    "highPriority": 9,
    "mediumPriority": 10,
    "lowPriority": 6,
    "completionRate": 28
  },
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

### 12. 오래된 Todo 정리 (Clean Up Old Todos)

**`DELETE /api/todos/cleanup/old?days=30`**

**쿼리 파라미터**:
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `days` | Number | `30` | 정리 기준일 (일 수) |

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "deletedCount": 5,
    "cutoffDate": "2025-10-11T00:00:00.000Z",
    "days": 30
  },
  "message": "Cleaned up todos older than 30 days",
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

## 🚨 오류 처리 (Error Handling)

### 표준 오응 포맷
```json
{
  "error": "오류 유형",
  "message": "상세 오류 메시지",
  "timestamp": "2025-11-10T10:00:00.000Z"
}
```

### 일반적인 오류 코드
| 상태 코드 | 오류 유형 | 설명 |
|----------|----------|------|
| `400` | Bad Request | 요청 형식이나 데이터가 유효하지 않음 |
| `404` | Not Found | 리소스를 찾을 수 없음 |
| `500` | Internal Server Error | 서버 내부 오류 |

### 유효성 검사 오류
```json
// 유효하지 않은 필터값
{
  "error": "Invalid filter parameter",
  "validFilters": ["all", "active", "completed"],
  "timestamp": "2025-11-10T10:00:00.000Z"
}

// 필수 필드 누락
{
  "error": "Text is required and must be a non-empty string",
  "timestamp": "2025-11-10T10:00:00.000Z"
}
```

---

## ⚡ 성능 및 모니터링 (Performance & Monitoring)

### 성능 메트릭
- **API 응답 시간**: <200ms (일반 요청)
- **검색 응답 시간**: <500ms (복잡 쿼리)
- **헬스 체크**: <100ms
- **최대 동시 연결**: 1000+

### 모니터링 엔드포인트
```bash
# 기본 헬스 체크
curl http://localhost:5000/api/todos/health

# 서비스 준비 상태
curl http://localhost:5000/api/todos/ready

# 실시간 통계
curl http://localhost:5000/api/todos/stats/overview
```

### 성능 모니터링 미들웨어
모든 API 요청은 성능 모니터링 미들웨어에 의해 자동으로 추적됩니다:
- 응답 시간 기록
- 메모리 사용량 모니터링
- 데이터베이스 쿼리 성능
- 오류율 추적

---

## 🔐 보안 사양 (Security Specifications)

### 보안 헤더
```http
# 자동 적용되는 보안 헤더
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
```

### CORS 설정
```http
Access-Control-Allow-Origin: http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:3000,http://localhost:8080
Access-Control-Allow-Credentials: true
```

### 입력 검증
- **XSS 방지**: Helmet.js로 보안 헤더 적용
- **입력 검증**: Joi 스키마 기반 검증
- **SQL 인젝션 방지**: Mongoose ODM 사용

### 데이터베이스 보안
- **연결 보안**: MongoDB 연결 문자열 암호화
- **암호화**: 민감 데이터 자동 마스킹
- **접근 제어**: 환경 변수 기반 인증

---

## 📋 데이터 스키마 (Data Schema)

### Todo 모델 스키마
```javascript
{
  _id: ObjectId,
  text: String,        // 할 일 내용 (필수)
  completed: Boolean, // 완료 여부 (레거시 필드)
  priority: String,    // 우선순위: low, medium, high
  status: String,     // 상태: pending, in_progress, completed
  statusHistory: [{
    fromStatus: String,
    toStatus: String,
    changedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 인덱스 설정
```javascript
// 텍스트 검색 인덱스
{ text: 'text' }

// 복합 인덱스
{ priority: -1, createdAt: -1 }
{ status: 1, createdAt: -1 }
```

---

## 💻 사용 예제 (Usage Examples)

### JavaScript/Axios 예제
```javascript
// Todo 생성
async function createTodo() {
  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '새로운 할 일',
        priority: 'high'
      })
    });

    const result = await response.json();
    console.log('생성된 Todo:', result.data);
  } catch (error) {
    console.error('오류:', error);
  }
}

// Todo 검색
async function searchTodos(query) {
  try {
    const response = await fetch(`/api/todos/search/${query}?filter=all&sortBy=created&limit=20`);
    const result = await response.json();
    console.log('검색 결과:', result.data);
  } catch (error) {
    console.error('오류:', error);
  }
}

// 상태 업데이트
async function updateTodoStatus(id, status) {
  try {
    const response = await fetch(`/api/todos/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    const result = await response.json();
    console.log('상태 업데이트:', result.data);
  } catch (error) {
    console.error('오류:', error);
  }
}
```

### cURL 예제
```bash
# Todo 생성
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "할 일 추가", "priority": "high"}'

# Todo 목록 조회
curl -X GET "http://localhost:5000/api/todos?filter=active&sortBy=priority&limit=10"

# 검색 수행
curl -X GET "http://localhost:5000/api/todos/search/important?filter=all&sortBy=relevance"

# 통계 정보 확인
curl -X GET http://localhost:5000/api/todos/stats/overview
```

---

## 🚀 배포 정보 (Deployment Information)

### 환경별 설정

#### 개발 환경
```bash
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug
MONGODB_URI=mongodb://localhost:27017/todo_dev
```

#### 프로덕션 환경
```bash
NODE_ENV=production
PORT=5000
LOG_LEVEL=warn
MONGODB_URI=${MONGODB_URI}
```

### 도커 배포
```yaml
services:
  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/todo_prod
    depends_on: [mongodb]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/todos/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 🔄 상태 전환 규칙 (Status Transition Rules)

유효한 상태 전환:
- `pending` → `in_progress`
- `pending` → `completed`
- `in_progress` → `completed`
- `completed` → `in_progress`
- `in_progress` → `pending`
- `completed` → `pending`

무효한 상태 전환 없음 (모든 전환 허용)

---

## ⚡ 성능 요구사항 (Performance Requirements)
- **응답 시간**: 일반 요청 < 200ms, 검색 요청 < 500ms
- **동시 처리**: 최대 100개 동시 요청 처리 가능
- **데이터 크기**: 최대 10MB 요청 본문 지원
- **쿼리 제한**: 최대 100개 결과 페이지당

---

## 🔐 보안 요구사항 (Security Requirements)
- **인증**: JWT 토큰 기반 인증 (준비 중)
- **권한**: 관리자만 정리 엔드포인트 접근
- **입력 검증**: 모든 입력값 검증
- **레이트 리밋**: 분당 100 요청 제한

---

**TAG:** @DOC:API-001 @CODE:TODO-BACKEND-001 @CODE:TODO-API-002 @SPEC:SPEC-UI-UX-DEPLOY-005

**문서 관리**: 이 문서는 `/alfred:3-sync` 명령으로 자동 동기화됩니다. 모든 변경사항은 Git에 커밋되어야 합니다.