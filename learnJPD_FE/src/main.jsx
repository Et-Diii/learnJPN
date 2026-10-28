import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
import { setupAxiosAuthInterceptors, startSessionWatcher } from './features/auth/utils/authSession'

// Cấu hình interceptor và bộ theo dõi phiên đăng nhập 1 tiếng
setupAxiosAuthInterceptors();
startSessionWatcher();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

