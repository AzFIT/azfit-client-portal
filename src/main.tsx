import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { initAuth, devAutoLogin } from './lib/auth.ts'

// Dev auto-login (seeds mock admin if no auth exists)
devAutoLogin()

// Initialize auth cache from Supabase on app startup
initAuth().catch(() => { /* ignore */ })

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
    <Toaster 
      position="top-right" 
      richColors 
      theme="dark"
      toastOptions={{
        style: {
          background: '#141414',
          border: '1px solid #2A2A2A',
          color: '#F0F0F0',
        },
      }}
    />
  </HashRouter>,
)
