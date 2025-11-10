---
id: DEPLOYMENT-001
version: 1.1.0
status: active
created: 2025-11-10
updated: 2025-11-10
author: @doc-syncer
priority: high
---

# 🚀 Docker 배포 가이드

## HISTORY

### v1.1.0 (2025-11-10)
- **UPDATED**: Docker 배포 시스템 문서 생성
- **AUTHOR**: @doc-syncer
- **USER**: GOOS (cyans)
- **LANGUAGE**: 한국어 (ko)
- **STATUS**: 완전한 Docker 컨테이너화 및 배포 시스템 구현

---

## @DOC:DEPLOY-001 배포 개요

### 배포 아키텍처

Todo 애플리케이션은 완전히 컨테이너화된 현대적인 배포 시스템을 채택하여 확장성과 유지보수성을 극대화합니다.

```
배포 아키텍처 (v1.1.0)
├── 개발 환경 (docker-compose.yml)
│   ├── backend: Node.js + Express
│   ├── frontend: React + Vite + TailwindCSS
│   └── mongo: MongoDB 데이터베이스
└── 프로덕션 환경 (docker-compose.prod.yml)
    ├── backend: 프로덕션 빌드
    ├── frontend: Nginx 리버스 프록시
    ├── mongo: MongoDB 복제본
    ├── nginx: 로드 밸런싱 및 캐싱
    └── redis: 캐싱 계층 (옵션)
```

### 핵심 특징

- **🐳 완전한 컨테이너화**: 모든 서비스가 Docker 컨테이너로 실행
- **⚡ 상태 점검**: 모든 컨테이너의 상태 모니터링
- **🔄 자동 재시작**: 장애 시 자동 복구
- **📊 로드 밸런싱**: Nginx를 통한 트래픽 분산
- **🔒 보안 강화**: 환경변수 기밀 유지, HTTPS 지원
- **📈 확장성**: 리소스 제한 및 배포 옵션

---

## @DOC:SETUP-001 환경 설정

### 사전 요구사항

```bash
# 필수 도구 설치
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Node.js 20.x (로컬 개발용)

# 시스템 요구사항
- 최소 2GB RAM
- 1GB 디스크 공간
- 네트워크 연결
```

### 환경 변수 설정

#### 개발 환경 (`.env.dev`)
```bash
# Backend
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo_dev
JWT_SECRET=dev_secret_key_change_in_production

# Frontend
VITE_API_URL=http://localhost:5000
VITE_ENABLE_VOICE_SEARCH=true
```

#### 프로덕션 환경 (`.env.prod`)
```bash
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
LOG_LEVEL=${LOG_LEVEL:-info}

# Frontend
VITE_API_URL=${API_URL}

# MongoDB
MONGO_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}

# Redis (선택사항)
REDIS_PASSWORD=${REDIS_PASSWORD}
```

---

## @DOC:DEV-001 개발 환경 배포

### 개발 환경 시작

```bash
# 1. 프로젝트 복제
git clone https://github.com/cyans/todo-app.git
cd todo-app

# 2. 환경 변수 설정
cp .env.dev .env
cp frontend/.env.dev frontend/.env

# 3. Docker Compose 실행
docker-compose up --build

# 4. 상태 확인
docker-compose ps
docker-compose logs
```

### 개발 환경 구성

```yaml
# 서비스별 포트 매핑
├── backend: localhost:5000
├── frontend: localhost:3000
└── mongo: localhost:27017

# 개발 기능
├── 핫 리로딩 (volumes)
├── 디버깅 로그
├── 상태 점검
└── 자동 재시작
```

### 개발 환경 점검

```bash
# API 상태 확인
curl http://localhost:5000/api/todos/health

# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs backend
docker-compose logs frontend
```

---

## @DOC:PROD-001 프로덕션 환경 배포

### 프로덕션 환경 시작

```bash
# 1. 환경 변수 설정
cp .env.example .env.prod
cp frontend/.env.production frontend/.env.prod

# 2. 프로덕션 빌드
docker-compose -f docker-compose.prod.yml build

# 3. 백그라운드 실행
docker-compose -f docker-compose.prod.yml up -d

# 4. 상태 확인
docker-compose -f docker-compose.prod.yml ps
```

### 프로덕션 구성

```yaml
# 서비스별 포트 매핑
├── frontend: localhost:80 (HTTPS 443)
├── backend: localhost:5000
├── mongo: localhost:27017
├── nginx: localhost:80 (로드 밸런싱)
└── redis: localhost:6379 (캐싱)

# 프로덕션 기능
├── Nginx 리버스 프록시
├── HTTPS 지원
├── 리소스 제한
├── 로드 밸런싱
├── 상태 점검
└── 로그 모니터링
```

### 프로덕션 점검

```bash
# 서비스 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 컨테이너 상태 점검
curl http://localhost/api/todos/health
curl http://localhost/api/todos/ready

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f nginx

# 리소스 사용량 확인
docker stats
```

---

## @DOC:HEALTH-001 상태 점검 시스템

### 상태 점검 엔드포인트

#### Backend 상태 점검
```bash
# 종합 상태 점검
curl http://localhost:5000/api/todos/health

# 준비 상태 확인
curl http://localhost:5000/api/todos/ready

# 활성 상태 확인
curl http://localhost:5000/api/todos/live

# 시작 상태 확인
curl http://localhost:5000/api/todos/startup
```

#### 상태 점검 응답 형식
```json
{
  "success": true,
  "data": {
    "total": 10,
    "byStatus": {
      "pending": 3,
      "in_progress": 4,
      "completed": 3
    },
    "byPriority": {
      "high": 2,
      "medium": 5,
      "low": 3
    }
  },
  "timestamp": "2025-11-10T10:00:00.000Z"
}
```

### 컨테이너 상태 점검

```bash
# Docker 상태 점검
docker-compose exec backend node healthcheck.js
docker-compose exec frontend wget --spider http://localhost/health

# 모니터링 스크립트
#!/bin/bash
# health_check.sh
services=("backend" "frontend" "mongo")
for service in "${services[@]}"; do
  if docker-compose ps $service | grep -q "Up"; then
    echo "✅ $service is running"
  else
    echo "❌ $service is down"
  fi
done
```

---

## @DOC:MONITOR-001 모니터링 및 로깅

### 로깅 정책

#### 로그 수준
```yaml
# 개발 환경
LOG_LEVEL=debug  # 모든 로그 표시

# 프로덕션 환경
LOG_LEVEL=info   # 기본 정보 로그
LOG_LEVEL=warn   # 경고 이상 로그
LOG_LEVEL=error  # 오류 로그만
```

#### 로그 형식
```json
{
  "timestamp": "2025-11-10T10:00:00.000Z",
  "level": "info",
  "service": "backend",
  "message": "Todo created successfully",
  "metadata": {
    "todo_id": "658a1b2c3d4e5f6a7b8c9d0e",
    "user_id": "user123"
  }
}
```

### 모니터링 스크립트

```bash
#!/bin/bash
# monitoring.sh

# 컨테이너 상태 모니터링
echo "=== 컨테이너 상태 ==="
docker-compose ps

# 리소스 사용량
echo -e "\n=== 리소스 사용량 ==="
docker stats --no-stream

# 로그 모니터링
echo -e "\n=== 최근 로그 ==="
docker-compose logs --tail=10 backend

# API 응답 시간
echo -e "\n=== API 응답 시간 ==="
curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:5000/api/todos/health
```

---

## @DOC:SCALE-001 확장 및 관리

### 확장 옵션

#### 수직 확장 (Scale Up)
```bash
# 리소스 증설
docker-compose up -d --scale backend=3 --scale frontend=3

# 리소스 제한 조정
docker update --memory=1g --cpus=1.0 todo-backend-1
```

#### 수평 확장 (Scale Out)
```bash
# Kubernetes 배포 (고급)
kubectl apply -f k8s/

# Docker Swarm 배포
docker stack deploy -c docker-compose.prod.yml todo-stack
```

### 백업 및 복원

#### 데이터베이스 백업
```bash
# MongoDB 백업
docker-compose exec mongo mongodump --out /backup/$(date +%Y%m%d)

# 복원
docker-compose exec mongo mongorestore /backup/20251110
```

#### 전체 시스템 백업
```bash
# 컨테이너 및 데이터 백업
docker-compose down
docker save -o todo-app-backup.tar backend frontend mongo
docker save -o todo-db-backup.tar mongo_data redis_data
```

---

## @DOC:TROUBLESHOOT-001 문제 해결

### 일반적인 문제

#### 1. 컨테이너 시작 실패
```bash
# 문제 진단
docker-compose logs backend
docker-compose logs frontend

# 컨테이너 재시작
docker-compose restart backend
docker-compose restart frontend

# 전체 재시작
docker-compose down
docker-compose up -d
```

#### 2. 데이터베이스 연결 문제
```bash
# MongoDB 상태 확인
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# 연결 문자열 확인
docker-compose exec backend env | grep MONGODB_URI

# 데이터베이스 초기화
docker-compose exec mongo mongosh todo_dev --eval "db.todos.drop()"
```

#### 3. 네트워크 문제
```bash
# 네트워크 상태 확인
docker network ls
docker network inspect todo-app_default

# 포트 충돌 확인
netstat -an | grep :5000
netstat -an | grep :3000
```

### 성능 문제

#### API 응답 시간 느림
```bash
# 성능 점검
curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:5000/api/todos/health

# 로그 확인
docker-compose logs --tail=20 backend | grep "performance"

# 리소스 사용량 확인
docker stats --no-stream
```

#### 메모리 부족
```bash
# 메모리 사용량 확인
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}"

# 메모리 제한 조정
docker update --memory=512m todo-backend
```

### 보안 문제

#### 환경 변수 노출
```bash
# 환경 변수 확인
docker-compose exec backend env | grep "SECRET"
docker-compose exec backend env | grep "URI"

# 보안 강화
docker-compose down
docker-compose up -d --env-file .env.prod
```

---

## @DOC:SECURITY-001 보안 강화

### 컨테이너 보안

#### 이미지 보안
```bash
# 이미지 스캔
docker scan todo-backend
docker scan todo-frontend

# 비밀번호 강화
openssl rand -base64 32  # JWT_SECRET 생성
openssl rand -base64 16  # REDIS_PASSWORD 생성
```

#### 네트워크 보안
```bash
# 네트워크 격리
docker network create --driver bridge todo-network-secure
docker-compose --network todo-network-secure up -d

# 방화벽 설정
ufw allow 5000/tcp  # Backend
ufw allow 80/tcp    # Frontend
ufw allow 443/tcp   # HTTPS
```

### 데이터 보안

#### 데이터 암호화
```bash
# 데이터베이스 암호화
docker-compose exec mongo mongosh --eval "db.runCommand({setParameter: 1, encryptionKey: 'your-encryption-key'})"

# 백업 암호화
tar -czf - backup/ | openssl enc -aes-256-cbc -salt -pbkdf2 -out backup_encrypted.tar.gz
```

#### 접근 제어
```bash
# 컨테이너 접근 제어
docker-compose exec backend bash -c 'exit 1'  # 비정상 종료 테스트
docker-compose logs --tail=5 backend

# 사용자 권한 제한
docker run --user=1000:1000 todo-backend
```

---

## @DOC:MIGRATION-001 마이그레이션 가이드

### 버전 업그레이드

#### 1. 백업
```bash
# 전체 시스템 백업
docker-compose down
docker-compose -f docker-compose.prod.yml down
docker save -o backup-$(date +%Y%m%d).tar backend frontend mongo
```

#### 2. 업그레이드
```bash
# 새 버전 빌드
docker-compose build --no-cache
docker-compose -f docker-compose.prod.yml build --no-cache

# 업그레이드 실행
docker-compose up -d
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. 검증
```bash
# 상태 확인
docker-compose ps
docker-compose -f docker-compose.prod.yml ps

# API 테스트
curl http://localhost:5000/api/todos/health
curl http://localhost/api/todos/health
```

---

## @DOC:OPTIMIZATION-001 성능 최적화

### 컨테이너 최적화

#### 이미지 크기 최적화
```bash
# 다단계 빌드
docker-compose build --no-cache

# 이미지 압축
docker-squish todo-backend
docker-squish todo-frontend
```

#### 리소스 최적화
```bash
# CPU 및 메모리 제한
docker-compose up -d \
  --limit-memory 512m \
  --limit-cpu 1.0 \
  backend

# 캐싱 활성화
docker-compose up -d \
  --env-file .env.prod \
  --build-arg CACHEBUST=$(date +%s) \
  frontend
```

### 네트워크 최적화

#### 캐싱 전략
```bash
# Nginx 캐싱
docker-compose exec nginx nginx -t
docker-compose exec nginx nginx -s reload

# CDN 연동
docker-compose exec nginx curl -I http://localhost/static/
```

---

## EARS Deployment Requirements

### Using EARS for Deployment

Apply EARS patterns when documenting deployment requirements and procedures:

#### Deployment EARS Example
```markdown
### Ubiquitous Requirements (Baseline Deployment)
- The system shall provide containerized deployment options.
- The system shall support both development and production environments.

### Event-driven Requirements
- WHEN a container fails, the system shall automatically restart it.
- WHEN a health check fails, the system shall alert administrators.

### State-driven Requirements
- WHILE in production mode, the system shall enforce resource limits.
- WHILE in development mode, the system shall provide hot reloading.

### Optional Features
- WHERE monitoring is required, the system may provide logging aggregation.
- WHERE high availability is needed, the system may support clustering.

### Constraints
- IF memory usage exceeds 80%, the system shall scale horizontally.
- Each deployment shall complete within 5 minutes.
```

---

**TAG:** @DOC:DEPLOYMENT-001 @CODE:TAG-DEPLOY-DOCKER-001 @SPEC:SPEC-UI-UX-DEPLOY-005

**문서 관리**: 이 문서는 `/alfred:3-sync` 명령으로 자동 동기화됩니다. 모든 변경사항은 Git에 커밋되어야 합니다.