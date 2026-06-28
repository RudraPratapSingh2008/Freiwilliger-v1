import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import * as Sentry from '@sentry/react'
import './sentry'
import './i18n'
import App from './App'
import store from './app/store'
import './index.css'

// Apply saved theme immediately to avoid flash
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Sentry.ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <App />
        </Suspense>
      </Sentry.ErrorBoundary>
    </Provider>
  </React.StrictMode>,
)
