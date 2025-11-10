// @CODE:TODO-FRONTEND-001 - Todo Frontend Main Application Entry Point
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/polyfills' // Load polyfills first
import './utils/criticalCSS' // Inject critical CSS early
import './utils/performance' // Initialize performance monitoring
import App from './App.jsx'

// Initialize performance monitoring and optimizations
if (typeof window !== 'undefined') {
  // Mark app initialization start
  performance.mark('app-init-start')

  // Initialize performance monitoring asynchronously
  import('./utils/performance').then(({ performanceMonitor }) => {
    performanceMonitor.init()
  })

  // Initialize bundle optimization asynchronously
  import('./utils/bundleOptimizer').then(({ bundleAnalyzer, networkLoader }) => {
    // Measure initial load
    setTimeout(() => {
      bundleAnalyzer.measureInitialLoad()
      performance.mark('app-init-complete')
      performance.measure('app-init', 'app-init-start', 'app-init-complete')
    }, 0)
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
