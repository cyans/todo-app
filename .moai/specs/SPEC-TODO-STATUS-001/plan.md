---
id: PLAN-TODO-STATUS-001
version: 1.0.0
status: completed
created: 2025-11-06
updated: 2025-11-07
author: @spec-builder
priority: critical
title: 할 일 상태 관리 시스템 구현 계획
spec_ref: @SPEC:TODO-STATUS-001
---

# @PLAN:TODO-STATUS-001 할 일 상태 관리 시스템 구현 계획

## 🎯 개요 (Overview)

본 계획은 @SPEC:TODO-STATUS-001의 요구사항을 구현하기 위한 상세한 기술 계획입니다. 기존 CRUD 시스템(@SPEC:TODO-CRUD-001)을 확장하여 상태 관리 기능을 구현합니다.

## 🏗️ 아키텍처 설계 (Architecture Design)

### 시스템 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   프론트엔드     │    │    백엔드 API    │    │   데이터베이스   │
│   React App     │◄──►│   Express.js    │◄──►│    MongoDB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    ┌─────────┐            ┌─────────────┐         ┌─────────────┐
    │Status UI │            │Status Service│         │ Task Model  │
    │Filter UI │            │History Service│         │History Log │
    │Stats UI  │            │Stats Service │         │ Index       │
    └─────────┘            └─────────────┘         └─────────────┘
```

### 데이터 모델 설계
```javascript
// 확장된 Task 모델
const taskSchema = {
  // 기존 필드 (@SPEC:TODO-CRUD-001)
  _id: ObjectId,
  title: String,
  description: String,
  createdAt: Date,
  updatedAt: Date,

  // 새로운 상태 관리 필드
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    required: true,
    index: true  // 상태 기반 조회 성능 최적화
  },

  statusHistory: [{
    fromStatus: String,
    toStatus: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, default: 'system' }, // 향후 사용자 ID로 확장
    reason: String,
    _id: false  // 배열 아이템에 자동 ID 생성 방지
  }]
};

// 상태 통계를 위한 집계 파이프라인 인덱스
const statusStatsIndex = {
  status: 1,
  createdAt: -1
};
```

## 📋 구현 단계 (Implementation Phases)

### 1단계: 백엔드 데이터 모델 확장
**담당**: tdd-implementer
**우선순위**: 높음
**의존성**: @SPEC:TODO-CRUD-001 완료

#### 1.1 데이터베이스 스키마 수정
- 기존 Task 모델에 status 필드 추가
- statusHistory 배열 필드 추가
- 데이터베이스 마이그레이션 스크립트 작성
- 인덱스 생성 (status, statusHistory.changedAt)

#### 1.2 서비스 레이어 확장
```javascript
// StatusService
class StatusService {
  async updateTaskStatus(taskId, newStatus, reason) {
    // 상태 전환 규칙 검증
    // 원자성 상태 변경
    // 이력 기록 생성
    // 알림 발송 (선택)
  }

  async getStatusHistory(taskId) {
    // 상태 변경 이력 조회
  }

  async getStatusStatistics() {
    // 상태별 통계 계산
  }

  validateStatusTransition(currentStatus, newStatus) {
    // 상태 전환 규칙 검증
  }
}
```

### 2단계: API 엔드포인트 구현
**담당**: tdd-implementer
**우선순위**: 높음
**의존성**: 1단계 완료

#### 2.1 상태 관리 API
```
PUT /api/todos/:id/status
- 상태 변경 처리
- 상태 전환 규칙 검증
- 이력 기록 생성

GET /api/todos/:id/status-history
- 상태 변경 이력 조회
- 페이지네이션 지원

GET /api/todos/stats
- 상태별 통계 제공
- 실시간 데이터 계산

GET /api/todos?status=pending,in_progress
- 상태 기반 필터링
- 다중 상태 선택 지원
```

#### 2.2 API 응답 표준화
```javascript
// 표준 응답 형식
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지",
  "timestamp": "2025-11-06T10:30:00Z",
  "errors": [] // 실패 시
}
```

### 3단계: 프론트엔드 컴포넌트 개발
**담당**: tdd-implementer
**우선순위**: 중간
**의존성**: 2단계 완료

#### 3.1 상태 선택 컴포넌트
```typescript
// StatusSelector.tsx
interface StatusSelectorProps {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  disabled?: boolean;
  showReason?: boolean;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  taskId,
  currentStatus,
  onStatusChange,
  disabled = false,
  showReason = false
}) => {
  // 드롭다운 또는 버튼 그룹 형태
  // 상태 전환 가능한 옵션만 표시
  // 변경 사유 입력 필드 (선택)
};
```

#### 3.2 상태 필터링 컴포넌트
```typescript
// StatusFilter.tsx
interface StatusFilterProps {
  selectedStatuses: TaskStatus[];
  onFilterChange: (statuses: TaskStatus[]) => void;
  totalCounts: Record<TaskStatus, number>;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatuses,
  onFilterChange,
  totalCounts
}) => {
  // 체크박스 또는 토글 버튼 형태
  // 각 상태별 카운트 표시
  // 실시간 필터링 적용
};
```

#### 3.3 상태 통계 컴포넌트
```typescript
// StatusStats.tsx
interface StatusStatsProps {
  stats: {
    [key in TaskStatus]: number;
  };
  total: number;
  loading?: boolean;
}

const StatusStats: React.FC<StatusStatsProps> = ({
  stats,
  total,
  loading = false
}) => {
  // 도넛 차트 또는 막대 그래프 형태
  // 퍼센티지 표시
  // 실시간 업데이트
};
```

### 4단계: 상태 이력 추적 기능
**담당**: tdd-implementer
**우선순위**: 중간
**의존성**: 3단계 완료

#### 4.1 이력 조회 컴포넌트
```typescript
// StatusHistory.tsx
interface StatusHistoryProps {
  taskId: string;
  history: StatusChangeRecord[];
  loading?: boolean;
}

const StatusHistory: React.FC<StatusHistoryProps> = ({
  taskId,
  history,
  loading = false
}) => {
  // 타임라인 형태로 변경 이력 표시
  // 상태 변경 시간, 이전 상태, 새로운 상태, 사유 표시
  // 무한 스크롤 또는 페이지네이션
};
```

#### 4.2 이력 데이터 최적화
- 상태 이력 데이터 페이지네이션
- 불필요한 이력 데이터 아카이빙
- 이력 조회 성능 최적화

### 5단계: 드래그앤드롭 기능 (선택)
**담당**: tdd-implementer
**우선순위**: 낮음
**의존성**: 4단계 완료
**참고**: 추가 기능으로 예산 및 시간 허용 시 구현

#### 5.1 칸반 보드 컴포넌트
```typescript
// KanbanBoard.tsx
interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  loading?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskStatusChange,
  loading = false
}) => {
  // react-beautiful-dnd 또는 @dnd-kit 사용
  // 상태별 컬럼 표시
  // 드래그앤드롭으로 상태 변경
  // 실시간 동기화
};
```

## 🛠️ 기술 스택 (Technology Stack)

### 백엔드
- **Node.js**: v18+
- **Express.js**: v4.18+
- **Mongoose**: v7.0+ (MongoDB ODM)
- **MongoDB**: v6.0+
- **Jest**: 단위 및 통합 테스트

### 프론트엔드
- **React**: v18+
- **TypeScript**: v5.0+
- **React Query**: 데이터 페칭 및 캐싱
- **React Hook Form**: 폼 관리
- **Chart.js 또는 Recharts**: 통계 시각화
- **React Testing Library**: 컴포넌트 테스트

### 드래그앤드롭 (선택)
- **@dnd-kit**: 현대적 드래그앤드롭 라이브러리
- **react-beautiful-dnd**: 대안 라이브러리

## 🎯 마일스톤 (Milestones)

### 마일스톤 1: 핵심 기능 (1주일)
- ✅ 데이터 모델 확장
- ✅ 기본 상태 변경 API
- ✅ 상태 선택 UI 컴포넌트
- ✅ 단위 테스트 완료

### 마일스톤 2: 고급 기능 (1주일)
- ✅ 상태 기반 필터링
- ✅ 상태별 통계
- ✅ 상태 변경 이력 추적
- ✅ 통합 테스트 완료

### 마일스톤 3: 사용자 경험 개선 (3일)
- ✅ 드래그앤드롭 기능 (선택)
- ✅ UI/UX 개선
- ✅ 성능 최적화
- ✅ E2E 테스트 완료

## 🔍 위험 및 대응 계획 (Risks & Mitigation)

### 기술적 위험
1. **데이터베이스 성능**
   - 위험: 상태 이력 데이터 증가로 인한 조회 성능 저하
   - 대응: 인덱스 최적화, 데이터 아카이빙 전략

2. **동시성 제어**
   - 위험: 동시 상태 변경으로 인한 데이터 불일치
   - 대응: 낙관적 잠금(Optimistic Locking) 구현

3. **프론트엔드 상태 동기화**
   - 위험: 여러 사용자 간 상태 변경 시 UI 불일치
   - 대응: 실시간 동기화 또는 폴링 전략

### 비즈니스 위험
1. **요구사항 변경**
   - 위험: 상태 전환 규칙 변경 요구
   - 대응: 유연한 상태 머신 구현

2. **사용자 채택**
   - 위험: 복잡한 상태 관리로 사용자 경험 저하
   - 대응: 단순한 기본 제공, 고급 기능 선택적 활성화

## 📊 성능 지표 (Performance Metrics)

### 응답 시간 목표
- 상태 변경 API: < 200ms
- 상태 목록 조회: < 500ms
- 통계 계산: < 100ms
- 이력 조회: < 300ms

### 확장성 목표
- 동시 사용자: 100명
- 일일 상태 변경: 10,000건
- 이력 데이터: 1년간 보관

## 🧪 테스트 전략 (Testing Strategy)

### 단위 테스트
- StatusService 로직 테스트
- 상태 전환 규칙 검증
- API 엔드포인트 단위 테스트

### 통합 테스트
- API와 데이터베이스 연동 테스트
- 상태 변경 E2E 플로우 테스트
- 동시성 시나리오 테스트

### UI 테스트
- React 컴포넌트 렌더링 테스트
- 사용자 인터랙션 테스트
- 접근성 테스트

## 📚 참고 문서 (References)

- @SPEC:TODO-CRUD-001: 기존 CRUD 시스템 명세
- @DOC:PRODUCT-001: 제품 정의 문서
- MongoDB 공식 문서: 데이터 모델링 가이드
- React 공식 문서: 컴포넌트 설계 가이드

---

**작성자**: @spec-builder
**검토자**: @implementation-planner
**승인자**: @quality-gate
**버전**: 0.1.0-draft