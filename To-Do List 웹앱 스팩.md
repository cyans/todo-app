다음은 **To-Do List 웹앱**을 개발하기 위한 기본 **기획/기술 사양서(Specification Document)** 입니다.
Markdown 포맷으로 작성되어 있어 바로 GitHub나 Notion 등에서 사용할 수 있습니다.

---

# 📝 To-Do List Web App Specification

## 1. 프로젝트 개요

* **프로젝트명:** To-Do List Web App
* **목적:** 사용자가 할 일을 손쉽게 추가, 수정, 삭제, 정렬, 카테고리화할 수 있는 간단하고 직관적인 웹 애플리케이션을 제공한다.
* **주요 특징:**

  * 직관적인 UI/UX
  * 로컬 저장(localStorage) 또는 사용자 로그인 기반 클라우드 저장 지원
  * 태그, 우선순위, 기한 설정 기능
  * 반응형 웹 디자인 (모바일/PC 겸용)

---

## 2. 시스템 개요

| 항목                 | 내용                                             |
| ------------------ | ---------------------------------------------- |
| **플랫폼**            | Web Application (Responsive)                   |
| **Frontend**       | React.js (Next.js 가능) + TailwindCSS            |
| **Backend**        | Node.js (Express)                              |
| **Database**       | MongoDB (또는 Firebase Firestore)                |
| **Authentication** | JWT 기반 로그인 / 소셜 로그인 (Google, Kakao)            |
| **배포 환경**          | Vercel (Frontend), Render 또는 Railway (Backend) |
| **버전 관리**          | GitHub                                         |
| **CI/CD**          | GitHub Actions                                 |

---

## 3. 기능 명세

### ✅ 핵심 기능 (구현 완료)

| 기능                   | 설명                                     |
| -------------------- | -------------------------------------- |
| **회원가입 / 로그인**       | 이메일 기반 계정 생성, JWT 인증 시스템 구현          |
| **할 일 추가**           | 제목, 설명, 마감일, 우선순위, 태그 입력 가능            |
| **할 일 편집 / 삭제**      | 개별 항목 클릭 시 수정/삭제 가능                    |
| **상태 관리 시스템**        | `todo` → `in_progress` → `done` 상태 전이 및 이력 추적 |
| **상태 이력 추적**         | 모든 상태 변경 이력 저장 및 조회 기능                  |
| **카테고리 분류**          | "업무", "개인", "학습" 등 카테고리 태그 지정          |
| **정렬 / 필터링**         | 날짜순, 우선순위순, 상태별, 태그별 정렬              |
| **검색 기능**            | 제목 및 내용 내 검색                           |
| **로컬 저장 / 클라우드 동기화** | 비로그인 시 localStorage, 로그인 시 DB 저장       |
| **반응형 디자인**          | PC, Tablet, Mobile 지원                  |
| **다크 모드 지원**         | 사용자 설정 또는 시스템 모드에 따라 전환 (개발 중)      |

### 🔧 고급 기능 (추가 구현)

| 기능                   | 설명                                     |
| -------------------- | -------------------------------------- |
| **상태 전이 검증**         | 유효한 상태 변경만 허용하는 비즈니스 로직              |
| **MongoDB 연결 최적화**     | 커넥션 풀링 및 타임아웃 설정으로 안정성 향상            |
| **비즈니스 로직 분리**       | 서비스 레이어를 통한 상태 관리 로직 분리               |
| **API 응답 최적화**        | 상태별 통계 데이터 제공                          |

---

## 4. UI/UX 설계

### 페이지 구조

1. **홈 (할 일 목록)**

   * 상단: 앱 로고, 프로필 아이콘, 검색창
   * 중앙: 필터/정렬 바 + 할 일 카드 리스트
   * 하단: `+` 버튼으로 새 할 일 추가 (모달 또는 사이드패널)
2. **할 일 상세 페이지 (옵션)**

   * 제목, 설명, 마감일, 우선순위, 태그 표시 및 수정 가능
3. **로그인/회원가입 페이지**

   * 이메일 로그인 / 소셜 로그인 버튼
4. **설정 페이지**

   * 프로필, 다크모드, 데이터 백업/복원

---

## 5. 데이터베이스 구조

### Collection: `users`

```json
{
  "user_id": "uuid",
  "email": "user@email.com",
  "name": "홍길동",
  "password_hash": "encrypted_string",
  "created_at": "2025-10-30T12:00:00Z"
}
```

### Collection: `todos` (이름 변경 및 상태 관리 필드 추가)

```json
{
  "todo_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "React 공부하기",
  "description": "Hooks 정리 및 useEffect 실습",
  "status": "todo",
  "statusHistory": [
    {
      "status": "todo",
      "changedBy": "user_id",
      "reason": "Todo 생성",
      "changedAt": "2025-11-07T10:00:00Z"
    }
  ],
  "priority": "medium",
  "tags": ["공부", "React"],
  "category": "학습",
  "dueDate": "2025-11-01",
  "createdAt": "2025-11-07T10:00:00Z",
  "updatedAt": "2025-11-07T10:00:00Z"
}
```

**상태 관계도:**
- `todo` → `in_progress` → `done`
- `todo` → `cancelled` (취소 상태)
- 상태 변경 시마다 `statusHistory`에 기록

---

## 6. API 설계

| Method   | Endpoint              | 설명            | 인증 |
| -------- | --------------------- | ------------- | -- |
| `POST`   | `/auth/signup`        | 회원가입          | ❌  |
| `POST`   | `/auth/login`         | 로그인           | ❌  |
| `GET`    | `/todos`              | 사용자 할 일 목록 조회 | ✅  |
| `POST`   | `/todos`              | 새 할 일 추가      | ✅  |
| `PUT`    | `/todos/:id`          | 할 일 수정        | ✅  |
| `DELETE` | `/todos/:id`          | 할 일 삭제        | ✅  |
| `PATCH`  | `/todos/:id/status`   | 상태 업데이트       | ✅  |
| `GET`    | `/todos/:id/history`  | 상태 이력 조회     | ✅  |
| `GET`    | `/todos/statistics`   | 상태별 통계 조회    | ✅  |

---

## 7. 기술 스택

| 구분              | 기술                                               |
| --------------- | ------------------------------------------------ |
| **Frontend**    | React.js, TailwindCSS, Axios, Zustand (state 관리) |
| **Backend**     | Node.js, Express.js, JWT, bcrypt, Mongoose        |
| **Database**    | MongoDB Atlas / Firebase Firestore               |
| **Status Logic** | 상태 전이 검증, 이력 추적, 비즈니스 로직 분리      |
| **Connection**  | MongoDB 커넥션 풀링 및 타임아웃 최적화           |
| **CI/CD**       | GitHub Actions, Vercel, Render                   |
| **Testing**     | Jest, React Testing Library, Supertest            |
| **Lint/Format** | ESLint, Prettier                                 |

---

## 8. 향후 확장 계획

### ✅ 최근 구현 완료
* ✅ **상태 관리 시스템:** `todo` → `in_progress` → `done` 상태 전이 및 이력 추적
* ✅ **MongoDB 연결 최적화:** 커넥션 풀링 및 타임아웃 설정
* ✅ **비즈니스 로직 분리:** 서비스 레이어를 통한 상태 관리 구현

### 🔄 다음 단계 계획
* 🔄 **알림 기능:** 마감일 하루 전 브라우저 알림 또는 이메일 알림
* 🔄 **캘린더 연동:** Google Calendar와 동기화
* 🔄 **공유 기능:** 팀원과 To-Do 리스트 공유
* 🔄 **AI 요약 기능:** 완료 항목 자동 정리 및 주간 리포트 생성

### 📋 추가 고려 사항
* 📋 **검색 및 필터링 기능 강화:** 상태별, 우선순위별, 태그별 고급 필터링
* 📋 **반응형 디자인 최적화:** 모바일 환경에서의 사용성 개선
* 📋 **다크 모드 전체 구현:** 시스템 테마 설정과의 연동

---

## 9. 일정 계획 (예시)

| 주차  | 작업 내용                      |
| --- | -------------------------- |
| 1주차 | 요구사항 정의, 와이어프레임 제작         |
| 2주차 | 프론트엔드 기본 구조 설계, UI 컴포넌트 제작 |
| 3주차 | 백엔드 API 구축 및 DB 연동         |
| 4주차 | 통합 테스트 및 버그 수정             |
| 5주차 | 배포 및 사용자 피드백 반영            |

---

## 10. 참고

* **디자인 가이드:** Figma / Tailwind UI
* **API 문서화:** Swagger 또는 Postman

---
