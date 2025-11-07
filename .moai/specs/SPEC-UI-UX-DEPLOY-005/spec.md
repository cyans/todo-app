---
id: SPEC-UI-UX-DEPLOY-005
version: 1.0.0
status: active
created: 2025-11-07
updated: 2025-11-07
author: @cyans
priority: high
title: UI/UX 향상 및 프로덕션 배포 시스템 (UI/UX Enhancement and Production Deployment System)
category: feature
labels:
  - ui-ux
  - responsive-design
  - dark-mode
  - deployment
  - docker
  - performance
depends_on:
  - @SPEC:TODO-CRUD-001
  - @SPEC:TODO-STATUS-001
  - @SPEC:FILTER-SEARCH-004
tags:
  - @SPEC:UI-UX-DEPLOY-005
  - @DOC:PRODUCT-001
  - @CODE:UI-UX-DEPLOY-005:RESPONSIVE
  - @CODE:UI-UX-DEPLOY-005:THEME
  - @CODE:UI-UX-DEPLOY-005:UX-ENHANCEMENT
  - @CODE:UI-UX-DEPLOY-005:DEPLOY-INFRA
  - @CODE:UI-UX-DEPLOY-005:MONITORING
  - @TEST:UI-UX-DEPLOY-005:RESPONSIVE
  - @TEST:UI-UX-DEPLOY-005:UX-TESTS
  - @TEST:UI-UX-DEPLOY-005:DEPLOYMENT
scope:
  packages:
    - frontend/src/components/responsive
    - frontend/src/components/theme
    - frontend/src/hooks
    - frontend/src/utils
    - deployment/docker
    - deployment/scripts
  files:
    - ThemeProvider.jsx
    - ResponsiveLayout.jsx
    - ErrorBoundary.jsx
    - LoadingStates.jsx
    - Dockerfile.frontend
    - Dockerfile.backend
    - docker-compose.yml
    - deploy.sh
---

# @SPEC:UI-UX-DEPLOY-005 UI/UX 향상 및 프로덕션 배포 시스템

## 📋 개요 (Overview)

이 문서는 Todo 애플리케이션의 UI/UX 향상 및 프로덕션 배포 시스템에 대한 상세한 명세서입니다. 반응형 디자인, 다크 모드 테마, 향상된 사용자 경험, 접근성 개선, 프로덕션 배포 인프라 구축, 성능 모니터링 및 운영 자동화 기능을 정의합니다.

## 🏷️ TAG 블록 (TAG Block)

```
@SPEC:UI-UX-DEPLOY-005
├── @CODE:UI-UX-DEPLOY-005:RESPONSIVE   - 반응형 디자인 시스템
├── @CODE:UI-UX-DEPLOY-005:THEME       - 테마 시스템 (다크 모드)
├── @CODE:UI-UX-DEPLOY-005:UX-ENHANCEMENT - UX 향상 기능
├── @CODE:UI-UX-DEPLOY-005:DEPLOY-INFRA  - 배포 인프라 구축
├── @CODE:UI-UX-DEPLOY-005:MONITORING    - 모니터링 시스템
├── @TEST:UI-UX-DEPLOY-005:RESPONSIVE    - 반응형 테스트
├── @TEST:UI-UX-DEPLOY-005:UX-TESTS      - UX 테스트
└── @TEST:UI-UX-DEPLOY-005:DEPLOYMENT    - 배포 테스트
```

## 🌍 환경 (Environment)

### 시스템 환경
- **프론트엔드**: React 19.1.1 with TypeScript, Tailwind CSS 4.1.16
- **백엔드**: Node.js 18+ with Express
- **데이터베이스**: MongoDB 5.0+
- **배포**: Docker, Docker Compose, CI/CD
- **모니터링**: Winston (logging), Morgan (HTTP logs), Health checks
- **테스트**: Jest, React Testing Library, Playwright (E2E)

### 기술 의존성
- **기존 시스템**: @SPEC:TODO-CRUD-001, @SPEC:TODO-STATUS-001, @SPEC:FILTER-SEARCH-004
- **디자인 시스템**: Tailwind CSS 4.1.16 (이미 설치됨)
- **상태 관리**: React Context API (테마), Zustand (앱 상태)
- **배포**: Docker, GitHub Actions 또는 GitLab CI
- **모니터링**: PM2 (프로세스 관리), Winston (로깅)

## 📖 가정 (Assumptions)

### 기술적 가정
1. 기존 Todo CRUD, 상태 관리, 검색 기능이 정상적으로 동작함
2. Tailwind CSS 4.1.16이 프론트엔드에 설치되어 있음
3. Docker 및 Docker Compose가 설치된 배포 환경이 있음
4. Git 기반의 CI/CD 파이프라인 구축이 가능함
5. 클라우드 플랫폼 (AWS, GCP, Azure) 또는 VPS 배포 환경이 있음

### 비즈니스 가정
1. 사용자들이 모바일 기기에서 애플리케이션을 사용할 필요성이 증가함
2. 다크 모드 사용자들이 점점 증가하고 있음
3. 프로덕션 환경에서의 안정성과 모니터링이 중요함
4. 향상된 사용자 경험이 사용자 만족도를 높일 것임
5. 자동화된 배포 프로세스가 개발 효율성을 향상시킬 것임

## ✅ 요구사항 (Requirements)

### 기능적 요구사항

#### FR1: 반응형 디자인 시스템
- **FR1.1**: 모바일 (320px+) 화면에서 완벽하게 동작해야 함
- **FR1.2**: 태블릿 (768px+) 화면에서 최적화된 레이아웃을 제공해야 함
- **FR1.3**: 데스크톱 (1024px+) 화면에서 최적의 사용자 경험을 제공해야 함
- **FR1.4**: 모든 기기에서 터치 인터랙션이 원활해야 함
- **FR1.5**: 이미지 및 컨텐츠가 화면 크기에 맞게 조절되어야 함

#### FR2: 테마 시스템 (다크 모드)
- **FR2.1**: 라이트/다크 모드 전환 기능을 제공해야 함
- **FR2.2**: 사용자의 테마 선호도를 localStorage에 저장해야 함
- **FR2.3**: 시스템 테마 자동 감지 기능을 지원해야 함
- **FR2.4**: 모든 UI 컴포넌트가 두 테마에서 일관되게 보여야 함
- **FR2.5**: 테마 전환 시 부드러운 애니메이션을 제공해야 함

#### FR3: 향상된 사용자 경험
- **FR3.1**: 전역 에러 바운더리를 구현해야 함
- **FR3.2**: 상세한 로딩 상태 표시를 제공해야 함
- **FR3.3**: 토스트/알림 시스템을 구현해야 함
- **FR3.4**: 오프라인 상태 감지 및 안내를 제공해야 함
- **FR3.5**: 키보드 단축키 지원을 제공해야 함

#### FR4: 접근성 향상
- **FR4.1**: WCAG 2.1 AA 표준을 준수해야 함
- **FR4.2**: 모든 인터랙티브 요소에 키보드 접근성을 제공해야 함
- **FR4.3**: 스크린 리더 지원을 강화해야 함
- **FR4.4**: 충분한 색상 대비를 보장해야 함
- **FR4.5**: 포커스 관리를 개선해야 함

#### FR5: 프로덕션 배포 시스템
- **FR5.1**: Docker 컨테이너화를 지원해야 함
- **FR5.2**: CI/CD 파이프라인을 구축해야 함
- **FR5.3**: 환경별 설정 관리 (dev, staging, prod)를 지원해야 함
- **FR5.4**: 자동화된 테스트 및 배포 프로세스를 제공해야 함
- **FR5.5**: 롤백 기능을 지원해야 함

#### FR6: 모니터링 및 로깅
- **FR6.1**: 구조화된 로깅 시스템을 구현해야 함
- **FR6.2**: 애플리케이션 성능 모니터링을 제공해야 함
- **FR6.3**: 헬스 체크 엔드포인트를 제공해야 함
- **FR6.4**: 에러 추적 및 보고 기능을 구현해야 함
- **FR6.5**: 사용자 행동 분석 기능을 제공해야 함

### 비기능적 요구사항

#### NFR1: 성능
- **NFR1.1**: 초기 페이지 로딩 시간은 2초 이내여야 함
- **NFR1.2**: 테마 전환 시간은 300ms 이내여야 함
- **NFR1.3**: 모바일 반응성은 60fps 이상의 애니메이션을 제공해야 함
- **NFR1.4**: 배포 시간은 10분 이내여야 함

#### NFR2: 호환성
- **NFR2.1**: 최신 3개 버전의 주요 브라우저를 지원해야 함
- **NFR2.2**: iOS 14+ 및 Android 8+를 지원해야 함
- **NFR2.3**: 다양한 화면 비율과 해상도를 지원해야 함

#### NFR3: 신뢰성
- **NFR3.1**: 시스템 가동 시간은 99.9% 이상이어야 함
- **NFR3.2**: 에러 발생 시 자동 복구 기능을 제공해야 함
- **NFR3.3**: 데이터 백업 및 복원 절차가 있어야 함

#### NFR4: 유지보수성
- **NFR4.1**: 코드 재사용성을 높여야 함
- **NFR4.2**: 컴포넌트 기반 아키텍처를 따라야 함
- **NFR4.3**: 명확한 문서화를 제공해야 함

## 📜 명세 (Specifications)

### EARS 기반 요구사항 명세

#### Ubiquitous Requirements (기본 요구사항)
- **UR1**: The system shall provide responsive design capabilities for all device types.
- **UR2**: The system shall provide light/dark theme switching functionality.
- **UR3**: The system shall provide enhanced user experience features including error boundaries and loading states.
- **UR4**: The system shall provide production-grade deployment and monitoring capabilities.
- **UR5**: The system shall maintain accessibility standards across all interfaces.

#### Event-driven Requirements (이벤트 기반 요구사항)
- **ER1**: WHEN a user resizes the browser window, the system shall immediately adjust the layout to fit the new viewport.
- **ER2**: WHEN a user toggles the theme, the system shall transition all UI elements to the new theme within 300ms.
- **ER3**: WHEN the network connection is lost, the system shall display offline mode indicators and disable network-dependent features.
- **ER4**: WHEN an error occurs in the application, the system shall display a graceful error message through the error boundary.
- **ER5**: WHEN code is pushed to the main branch, the system shall automatically run tests and deploy to production.
- **ER6**: WHEN a user interacts with touch elements on mobile devices, the system shall provide appropriate touch feedback.
- **ER7**: WHEN the application loads, the system shall display detailed loading indicators for different components.

#### State-driven Requirements (상태 기반 요구사항)
- **SR1**: WHILE the application is in a loading state, the system shall display skeleton loaders and progress indicators.
- **SR2**: WHILE a user has selected a specific theme, the system shall persist and apply that theme across all pages and sessions.
- **SR3**: WHILE the viewport width is below 768px, the system shall provide touch-optimized interface elements and navigation.
- **SR4**: WHILE the application is running in production environment, the system shall enable comprehensive logging and monitoring.
- **SR5**: WHILE the user is offline, the system shall queue actions and sync them when connectivity is restored.
- **SR6**: WHILE the system is performing background operations, the system shall provide non-intrusive progress indicators.

#### Optional Features (선택적 기능)
- **OR1**: WHERE a user requests advanced settings, the system may provide custom theme color configuration options.
- **OR2**: WHERE a developer needs debugging capabilities, the system may provide a developer tools panel with performance metrics.
- **OR3**: WHERE an administrator needs to monitor system status, the system may provide an admin dashboard with system health indicators.
- **OR4**: WHERE a user has accessibility needs, the system may provide additional accessibility options like font size adjustment.

#### Constraints (제약 조건)
- **CR1**: IF the screen width is below 320px, the system shall display a minimal mobile-optimized layout with essential features only.
- **CR2**: IF the network connection speed is detected as 3G or slower, the system shall optimize data usage and reduce non-essential resource loading.
- **CR3**: IF the browser does not support modern web standards, the system shall provide fallback functionality and inform the user of limitations.
- **CR4**: IF system resource usage exceeds 80%, the system shall activate performance optimization mode and reduce non-critical features.
- **CR5**: IF a deployment fails health checks, the system shall automatically rollback to the previous stable version.
- **CR6**: IF the database connection is lost, the system shall attempt reconnection with exponential backoff and display appropriate user messaging.

### S1: 반응형 디자인 시스템

#### Tailwind CSS 반응형 설정
```css
/* tailwind.config.js 확장 */
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    }
  }
}
```

#### 반응형 레이아웃 컴포넌트
```typescript
// ResponsiveLayout.jsx
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-4 sm:py-6 lg:py-8">
          {/* 모바일: 중앙 정렬, 데스크톱: 좌측 정렬 */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              📝 To-Do List
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              Manage your tasks efficiently
            </p>
          </div>
        </header>

        <main className="py-4 sm:py-6 lg:py-8">
          {/* 모바일: 전체 너비, 태블릿: 패딩, 데스크톱: 최대 너비 제한 */}
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
```

#### 모바일 최적화 컴포넌트
```typescript
// MobileOptimizedCard.jsx
interface MobileOptimizedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border
        border-gray-200 dark:border-gray-700 p-4 sm:p-6
        transform transition-all duration-200
        hover:shadow-md hover:scale-[1.02]
        active:scale-[0.98]
        cursor-pointer
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

### S2: 테마 시스템 구현

#### 테마 컨텍스트 설정
```typescript
// ThemeContext.jsx
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  effectiveTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // localStorage에서 테마 설정 로드
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // 시스템 테마 감지
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      setEffectiveTheme(systemTheme);
    } else {
      setEffectiveTheme(theme);
    }

    // localStorage에 테마 저장
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // HTML 클래스에 테마 적용
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
  }, [effectiveTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### 테마 전환 컴포넌트
```typescript
// ThemeToggle.jsx
const ThemeToggle: React.FC = () => {
  const { theme, effectiveTheme, toggleTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-colors ${
          effectiveTheme === 'light'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        title="Light mode"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-colors ${
          effectiveTheme === 'dark'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        title="Dark mode"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'system'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        title="System theme"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
```

### S3: 향상된 UX 기능

#### 전역 에러 바운더리
```typescript
// ErrorBoundary.jsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    // 에러 로깅 서비스에 전송 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // 프로덕션에서는 에러 추적 서비스로 전송
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened.
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </p>
            <button
              onClick={this.handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 향상된 로딩 상태 컴포넌트
```typescript
// LoadingStates.jsx
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
    </div>
  );
};

const SkeletonLoader: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};

const ProgressLoader: React.FC<{
  progress: number;
  message?: string;
  showPercentage?: boolean
}> = ({ progress, message, showPercentage = true }) => {
  return (
    <div className="w-full">
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{message}</p>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-right">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
};
```

#### 토스트 알림 시스템
```typescript
// ToastSystem.jsx
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    if (!toast.persistent && toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {/* 앱 컴포넌트들이 ToastContext를 사용할 수 있도록 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({
  toast,
  onClose
}) => {
  const iconMap = {
    success: <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
    error: <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
    warning: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
    info: <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
  };

  return (
    <div className={`
      flex items-start p-4 rounded-lg shadow-lg border transform transition-all duration-300
      ${toast.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}
      ${toast.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : ''}
      ${toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' : ''}
      ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''}
    `}>
      <div className="flex-shrink-0">
        {iconMap[toast.type]}
      </div>
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
```

### S4: 프로덕션 배포 시스템

#### Docker 컨테이너 설정
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY frontend/package*.json ./
RUN npm ci --only=production

# 소스 코드 복사 및 빌드
COPY frontend/ .
RUN npm run build

# 프로덕션 이미지
FROM nginx:alpine

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 설정 복사
COPY deployment/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# Dockerfile.backend
FROM node:18-alpine

WORKDIR /app

# 의존성 설치
COPY backend/package*.json ./
RUN npm ci --only=production

# 소스 코드 복사
COPY backend/ .

# 환경 변수 설정
ENV NODE_ENV=production

EXPOSE 3000

# 헬스 체크 스크립트 추가
COPY deployment/healthcheck.js ./healthcheck.js
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
    depends_on:
      - mongodb
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
      - ./deployment/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./deployment/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./deployment/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
```

#### CI/CD 파이프라인 설정
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && npm ci

    - name: Run tests
      run: |
        cd frontend && npm run test:coverage
        cd ../backend && npm run test:coverage

    - name: Run linting
      run: |
        cd frontend && npm run lint
        cd ../backend && npm run lint

    - name: Build applications
      run: |
        cd frontend && npm run build
        cd ../backend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/app
          git pull origin main
          docker-compose down
          docker-compose up --build -d
          docker system prune -f

    - name: Run health checks
      run: |
        sleep 30
        curl -f ${{ secrets.PROD_URL }}/api/health || exit 1
        curl -f ${{ secrets.PROD_URL }}/ || exit 1

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

#### 배포 스크립트
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment process..."

# 환경 변수 확인
if [ -z "$MONGODB_URI" ] || [ -z "$JWT_SECRET" ]; then
    echo "❌ Missing required environment variables"
    exit 1
fi

# 현재 브랜치 확인
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📦 Deploying branch: $BRANCH"

# 백업 생성
echo "💾 Creating backup..."
docker-compose exec mongodb mongodump --out /data/backup/$(date +%Y%m%d_%H%M%S)

# 애플리케이션 중지
echo "⏹️ Stopping current application..."
docker-compose down

# 최신 코드 가져오기
echo "📥 Pulling latest changes..."
git pull origin $BRANCH

# 이미지 빌드
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# 애플리케이션 시작
echo "▶️ Starting application..."
docker-compose up -d

# 헬스 체크
echo "🏥 Running health checks..."
sleep 30

# 백엔드 헬스 체크
for i in {1..10}; do
    if curl -f http://localhost:3000/api/health; then
        echo "✅ Backend health check passed"
        break
    else
        echo "⏳ Waiting for backend to start... ($i/10)"
        sleep 10
    fi

    if [ $i -eq 10 ]; then
        echo "❌ Backend health check failed"
        exit 1
    fi
done

# 프론트엔드 헬스 체크
for i in {1..10}; do
    if curl -f http://localhost; then
        echo "✅ Frontend health check passed"
        break
    else
        echo "⏳ Waiting for frontend to start... ($i/10)"
        sleep 10
    fi

    if [ $i -eq 10 ]; then
        echo "❌ Frontend health check failed"
        exit 1
    fi
done

echo "🎉 Deployment completed successfully!"

# 로그 모니터링
echo "📊 Monitoring application logs..."
docker-compose logs -f --tail=100
```

### S5: 모니터링 및 로깅 시스템

#### 구조화된 로깅 설정
```javascript
// backend/src/utils/logger.js
import winston from 'winston';
import path from 'path';

// 로그 포맷 설정
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// 로거 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'todo-backend' },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 모든 로그 파일
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 콘솔 출력 (개발 환경)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    })
  ]
});

// 프로덕션 환경에서는 추가 설정
if (process.env.NODE_ENV === 'production') {
  // 로그를 외부 서비스로 전송 (선택적)
  // logger.add(new winston.transports.Http({ ... }));
}

export default logger;
```

#### 헬스 체크 미들웨어
```javascript
// backend/src/middleware/health.js
import logger from '../utils/logger.js';

const healthCheck = async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    checks: {}
  };

  try {
    // 데이터베이스 연결 확인
    const dbStatus = await checkDatabase();
    healthStatus.checks.database = dbStatus;

    // 메모리 사용량 확인
    const memoryUsage = process.memoryUsage();
    healthStatus.checks.memory = {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
    };

    // 전체 상태 확인
    const allChecksHealthy = Object.values(healthStatus.checks).every(check => check.status === 'ok');

    if (!allChecksHealthy) {
      healthStatus.status = 'degraded';
      return res.status(503).json(healthStatus);
    }

    logger.info('Health check passed', healthStatus);
    res.json(healthStatus);

  } catch (error) {
    logger.error('Health check failed:', error);
    healthStatus.status = 'error';
    healthStatus.error = error.message;
    res.status(503).json(healthStatus);
  }
};

const checkDatabase = async () => {
  try {
    // 실제 데이터베이스 연결 확인 로직
    await mongoose.connection.db.admin().ping();
    return { status: 'ok', responseTime: Date.now() };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

export default healthCheck;
```

#### 성능 모니터링 미들웨어
```javascript
// backend/src/middleware/performance.js
import logger from '../utils/logger.js';

const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();

  // 응답 시간 측정을 위한 res.on 종료 리스너
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    };

    // 느린 요청 로깅 (1초 이상)
    if (duration > 1000) {
      logger.warn('Slow request detected', logData);
    } else {
      logger.info('Request completed', logData);
    }

    // 성능 메트릭 수집 (선택적)
    // metrics.record('api.request.duration', duration, {
    //   method: req.method,
    //   route: req.route?.path,
    //   status: res.statusCode
    // });
  });

  next();
};

export default performanceMonitor;
```

## 📊 추적성 (Traceability)

### @TAG 체인 연결
```
@SPEC:UI-UX-DEPLOY-005
├── 구현: @CODE:UI-UX-DEPLOY-005:* (모든 구현 태그)
├── 테스트: @TEST:UI-UX-DEPLOY-005:* (모든 테스트 태그)
├── 의존: @SPEC:TODO-CRUD-001 (기존 CRUD 시스템)
├── 의존: @SPEC:TODO-STATUS-001 (상태 관리 시스템)
├── 의존: @SPEC:FILTER-SEARCH-004 (검색 필터링 시스템)
└── 문서: @DOC:PRODUCT-001 (제품 문서 연결)
```

### 요구사항 추적 매트릭스
| 요구사항 | 구현 태그 | 테스트 태그 | 상태 |
|----------|-----------|-------------|------|
| FR1: 반응형 디자인 | @CODE:UI-UX-DEPLOY-005:RESPONSIVE | @TEST:UI-UX-DEPLOY-005:RESPONSIVE | 계획 |
| FR2: 테마 시스템 | @CODE:UI-UX-DEPLOY-005:THEME | @TEST:UI-UX-DEPLOY-005:UX-TESTS | 계획 |
| FR3: UX 향상 | @CODE:UI-UX-DEPLOY-005:UX-ENHANCEMENT | @TEST:UI-UX-DEPLOY-005:UX-TESTS | 계획 |
| FR4: 접근성 | @CODE:UI-UX-DEPLOY-005:UX-ENHANCEMENT | @TEST:UI-UX-DEPLOY-005:UX-TESTS | 계획 |
| FR5: 배포 시스템 | @CODE:UI-UX-DEPLOY-005:DEPLOY-INFRA | @TEST:UI-UX-DEPLOY-005:DEPLOYMENT | 계획 |
| FR6: 모니터링 | @CODE:UI-UX-DEPLOY-005:MONITORING | @TEST:UI-UX-DEPLOY-005:DEPLOYMENT | 계획 |

### 페이즈별 구현 계획
- **Phase 1 (UI/UX)**: FR1, FR2, FR3, FR4 - 반응형 디자인, 테마 시스템, UX 향상
- **Phase 2 (배포)**: FR5 - 프로덕션 배포 인프라 구축
- **Phase 3 (모니터링)**: FR6 - 로깅, 모니터링, 헬스 체크 시스템

## HISTORY

### v1.0.0 (2025-11-07) - Initial Draft
- **CREATED**: Initial SPEC document for UI/UX Enhancement and Production Deployment System
- **AUTHOR**: @cyans
- **SECTIONS**: Complete EARS-based requirements specification
- **KEY ACHIEVEMENTS**:
  - ✅ **UR1-UR5**: 기본 요구사항 (Ubiquitous Requirements) 정의 완료
  - ✅ **ER1-ER7**: 이벤트 기반 요구사항 (Event-driven Requirements) 명세 완료
  - ✅ **SR1-SR6**: 상태 기반 요구사항 (State-driven Requirements) 정의 완료
  - ✅ **OR1-OR4**: 선택적 기능 (Optional Features) 명세 완료
  - ✅ **CR1-CR6**: 제약 조건 (Constraints) 정의 완료
  - ✅ **FR1-FR6**: 기능적 요구사항 정의 완료 (반응형 디자인, 테마 시스템, UX 향상, 접근성, 배포 시스템, 모니터링)
  - ✅ **NFR1-NFR4**: 비기능적 요구사항 정의 완료 (성능, 호환성, 신뢰성, 유지보수성)
  - ✅ **S1-S5**: 상세 기술 명세 완료 (반응형 디자인, 테마 시스템, UX 향상, 배포 시스템, 모니터링)
  - ✅ **@TAG 체인**: 추적성 시스템 구조 정의 완료
  - ✅ **의존성**: @SPEC:TODO-CRUD-001, @SPEC:TODO-STATUS-001, @SPEC:FILTER-SEARCH-004 연결 완료
- **TECHNICAL SPECIFICATIONS**:
  - React 19.1.1 with TypeScript
  - Tailwind CSS 4.1.16 for responsive design
  - Docker containerization strategy
  - CI/CD pipeline architecture
  - Winston logging system
  - Performance monitoring middleware
- **DEPENDENCIES ESTABLISHED**:
  - @SPEC:TODO-CRUD-001 (CRUD 기능 기반)
  - @SPEC:TODO-STATUS-001 (상태 관리 기반)
  - @SPEC:FILTER-SEARCH-004 (검색 필터링 기반)
- **IMPLEMENTATION PHASES DEFINED**:
  - Phase 1: UI/UX 향상 (반응형 디자인, 테마, UX 기능)
  - Phase 2: 배포 시스템 (Docker, CI/CD)
  - Phase 3: 모니터링 시스템 (로깅, 헬스 체크, 성능 모니터링)

---

**작성자**: @spec-builder
**검토자**: @implementation-planner
**승인자**: @quality-gate
**버전**: 1.0.0-draft
**상태**: draft → ready for implementation