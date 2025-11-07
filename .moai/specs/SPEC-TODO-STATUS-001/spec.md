---
id: SPEC-TODO-STATUS-001
version: 1.0.0
status: completed
created: 2025-11-06
updated: 2025-11-07
author: @spec-builder
priority: critical
title: 할 일 상태 관리 시스템 (Todo Status Management System)
tags:
  - @SPEC:TODO-STATUS-001
  - @DOC:PRODUCT-001
  - @CODE:TODO-CRUD-001
dependencies:
  - @SPEC:TODO-CRUD-001
---

# @SPEC:TODO-STATUS-001 할 일 상태 관리 시스템

## 📋 개요 (Overview)

이 문서는 Todo 애플리케이션의 상태 관리 시스템에 대한 상세한 명세서입니다. 기존의 단순한 completed 상태에서 확장된 상태 관리, 변경 이력 추적, 상태 기반 필터링 등 고급 기능을 정의합니다.

## 🏷️ TAG 블록 (TAG Block)

```
@SPEC:TODO-STATUS-001
├── @CODE:TODO-STATUS-001:MODEL     - 상태 데이터 모델
├── @CODE:TODO-STATUS-001:SERVICE   - 상태 관리 서비스 로직
├── @CODE:TODO-STATUS-001:API       - 상태 변경 API 엔드포인트
├── @CODE:TODO-STATUS-001:UI        - 상태 관리 UI 컴포넌트
├── @CODE:TODO-STATUS-001:HISTORY   - 변경 이력 추적 시스템
├── @TEST:TODO-STATUS-001:UNIT      - 단위 테스트
├── @TEST:TODO-STATUS-001:INTEGRATION - 통합 테스트
└── @TEST:TODO-STATUS-001:E2E       - E2E 테스트
```

## 🌍 환경 (Environment)

### 시스템 환경
- **프론트엔드**: React 18+ with TypeScript
- **백엔드**: Node.js with Express
- **데이터베이스**: MongoDB
- **테스트 프레임워크**: Jest, React Testing Library
- **API 스타일**: RESTful

### 기술 의존성
- **기존 CRUD 시스템**: @SPEC:TODO-CRUD-001 완전 의존
- **데이터 모델**: 기존 Task 모델 확장
- **API 아키텍처**: 기존 RESTful 패턴 확장

## 📖 가정 (Assumptions)

### 기술적 가정
1. 기존 Todo CRUD 기능이 정상적으로 동작함 (@SPEC:TODO-CRUD-001)
2. MongoDB 데이터베이스가 안정적으로 운영됨
3. React 애플리케이션 상태 관리가 기존 패턴을 따름
4. API 클라이언트가 기존 HTTP 클라이언트 패턴을 확장 가능

### 비즈니스 가정
1. 사용자는 할 일의 진행 상태를 세분화하여 관리하고자 함
2. 상태 변경 이력 추적이 작업 관리에 중요함
3. 상태 기반 필터링이 생산성 향상에 기여함
4. 드래그앤드롭 인터페이스가 사용자 경험을 향상시킴

## ✅ 요구사항 (Requirements)

### 기능적 요구사항

#### FR1: 상태 모델 확장
- **FR1.1**: 시스템은 4가지 상태(pending, in_progress, completed, cancelled)를 지원해야 함
- **FR1.2**: 각 상태는 고유한 ID와 설명을 가짐
- **FR1.3**: 상태 전환 규칙이 정의되어야 함

#### FR2: 상태 변경 기능
- **FR2.1**: 사용자는 할 일의 상태를 변경할 수 있어야 함
- **FR2.2**: 상태 변경은 즉시 데이터베이스에 반영되어야 함
- **FR2.3**: 상태 변경 시 UI가 즉시 업데이트되어야 함

#### FR3: 변경 이력 추적
- **FR3.1**: 모든 상태 변경은 이력으로 기록되어야 함
- **FR3.2**: 이력에는 변경 시간, 이전 상태, 새로운 상태, 변경자가 포함되어야 함
- **FR3.3**: 사용자는 특정 할 일의 변경 이력을 조회할 수 있어야 함

#### FR4: 상태 기반 필터링
- **FR4.1**: 사용자는 상태별로 할 일 목록을 필터링할 수 있어야 함
- **FR4.2**: 여러 상태를 동시에 선택하여 필터링할 수 있어야 함
- **FR4.3**: 필터링 결과는 실시간으로 업데이트되어야 함

#### FR5: 상태별 통계
- **FR5.1**: 시스템은 각 상태별 할 일 수를 통계로 제공해야 함
- **FR5.2**: 통계는 실시간으로 계산되어야 함
- **FR5.3**: 시간에 따른 상태 변화 추이를 제공해야 함

#### FR6: 드래그앤드롭 상태 변경 (선택)
- **FR6.1**: 사용자는 할 일을 드래그하여 상태를 변경할 수 있어야 함
- **FR6.2**: 드래그앤드롭 인터페이스는 직관적이어야 함
- **FR6.3**: 드래그 중에는 시각적 피드백을 제공해야 함

### 비기능적 요구사항

#### NFR1: 성능
- **NFR1.1**: 상태 변경 응답 시간은 200ms 이내여야 함
- **NFR1.2**: 상태 목록 로딩 시간은 500ms 이내여야 함
- **NFR1.3**: 통계 계산은 100ms 이내에 완료되어야 함

#### NFR2: 데이터 일관성
- **NFR2.1**: 상태 변경은 원자성(atomic)을 보장해야 함
- **NFR2.2**: 이력 기록과 상태 변경은 트랜잭션으로 처리되어야 함
- **NFR2.3**: 동시성 상태 변경 충돌을 방지해야 함

#### NFR3: 사용자 경험
- **NFR3.1**: 상태 변경은 사용자가 취소할 수 있어야 함
- **NFR3.2**: 상태 변경 실패 시 명확한 에러 메시지를 제공해야 함
- **NFR3.3**: 상태 전환 경로는 논리적이어야 함

## 📜 명세 (Specifications)

### S1: 상태 데이터 모델

#### 상태 정의
```javascript
const TaskStatus = {
  PENDING: 'pending',      // 대기 중
  IN_PROGRESS: 'in_progress', // 진행 중
  COMPLETED: 'completed',   // 완료됨
  CANCELLED: 'cancelled'    // 취소됨
};
```

#### 상태 전환 규칙
- `pending` → `in_progress` (작업 시작)
- `pending` → `cancelled` (작업 취소)
- `in_progress` → `completed` (작업 완료)
- `in_progress` → `pending` (작업 보류)
- `in_progress` → `cancelled` (작업 취소)
- `completed` → `in_progress` (작업 재개)
- `completed` → `pending` (작업 재할당)
- `cancelled` → `pending` (작업 재시작)

#### 데이터베이스 스키마 확장
```javascript
// 기존 Task 모델 확장
const taskSchema = {
  // ... 기존 필드
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    required: true
  },
  statusHistory: [{
    fromStatus: String,
    toStatus: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: String, // 향후 사용자 ID로 확장 가능
    reason: String    // 상태 변경 사유 (선택)
  }]
};
```

### S2: 상태 관리 API

#### 상태 변경 API
```
PUT /api/todos/:id/status
Content-Type: application/json

Request Body:
{
  "status": "in_progress",
  "reason": "작업 시작" (선택)
}

Response:
{
  "success": true,
  "task": { ... updated task with status history ... },
  "message": "상태가 성공적으로 변경되었습니다"
}
```

#### 상태 이력 조회 API
```
GET /api/todos/:id/status-history

Response:
{
  "success": true,
  "history": [
    {
      "fromStatus": "pending",
      "toStatus": "in_progress",
      "changedAt": "2025-11-06T10:30:00Z",
      "changedBy": "system",
      "reason": "작업 시작"
    }
  ]
}
```

#### 상태별 통계 API
```
GET /api/todos/stats

Response:
{
  "success": true,
  "stats": {
    "pending": 5,
    "in_progress": 3,
    "completed": 12,
    "cancelled": 1,
    "total": 21
  },
  "updatedAt": "2025-11-06T10:35:00Z"
}
```

### S3: 프론트엔드 컴포넌트

#### StatusSelector 컴포넌트
```typescript
interface StatusSelectorProps {
  currentStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus, reason?: string) => void;
  disabled?: boolean;
  showReason?: boolean;
}
```

#### StatusFilter 컴포넌트
```typescript
interface StatusFilterProps {
  selectedStatuses: TaskStatus[];
  onStatusFilterChange: (statuses: TaskStatus[]) => void;
  availableStatuses: TaskStatus[];
}
```

#### StatusHistory 컴포넌트
```typescript
interface StatusHistoryProps {
  taskId: string;
  history: StatusChangeRecord[];
  maxItems?: number;
}
```

### S4: 드래그앤드롭 구현 (선택 기능)

#### KanbanBoard 컴포넌트
```typescript
interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  columns: {
    [key in TaskStatus]: {
      title: string;
      color: string;
    };
  };
}
```

## 📊 추적성 (Traceability)

### @TAG 체인 연결
```
@SPEC:TODO-STATUS-001
├── 구현: @CODE:TODO-STATUS-001:* (모든 구현 태그)
├── 테스트: @TEST:TODO-STATUS-001:* (모든 테스트 태그)
├── 의존: @SPEC:TODO-CRUD-001 (기존 CRUD 시스템)
└── 문서: @DOC:PRODUCT-001 (제품 문서 연결)
```

### 요구사항 추적 매트릭스
| 요구사항 | 구현 태그 | 테스트 태그 | 상태 |
|----------|-----------|-------------|------|
| FR1: 상태 모델 | @CODE:TODO-STATUS-001:MODEL | @TEST:TODO-STATUS-001:MODEL | 완료 |
| FR2: 상태 변경 | @CODE:TODO-STATUS-001:API | @TEST:TODO-STATUS-001:API | 완료 |
| FR3: 이력 추적 | @CODE:TODO-STATUS-001:HISTORY | @TEST:TODO-STATUS-001:HISTORY | 완료 |
| FR4: 필터링 | @CODE:TODO-STATUS-001:UI | @TEST:TODO-STATUS-001:UI | 완료 |
| FR5: 통계 | @CODE:TODO-STATUS-001:SERVICE | @TEST:TODO-STATUS-001:SERVICE | 완료 |
| FR6: 드래그앤드롭 | @CODE:TODO-STATUS-001:UI:KANBAN | @TEST:TODO-STATUS-001:E2E | 완료 |

## 📜 구현 이력 (Implementation History)

### 2025-11-07 - v1.0.0 Completed
- ✅ **TAG-001**: 데이터베이스 스키마 확장 완료
- ✅ **TAG-002**: 상태 변경 API 엔드포인트 구현 완료
- ✅ **TAG-003**: 상태 변경 이력 추적 시스템 구현 완료
- ✅ **TAG-004**: 상태 기반 필터링 UI 구현 완료
- ✅ **TAG-005**: 상태별 통계 기능 구현 완료
- ✅ 모든 기능 요구사항(기능적/비기능적) 구현 완료
- ✅ 모든 수용 기준 시나리오 통과
- ✅ 단위/통합/E2E 테스트 완료
- ✅ 성능 테스트 통과 (응답 시간 목표 달성)
- ✅ 코드 리뷰 완료 및 배포 준비 완료

---

**작성자**: @spec-builder
**검토자**: @implementation-planner
**승인자**: @quality-gate
**버전**: 1.0.0-completed