import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true })
    }
  }, [navigate, location.pathname])

  if (!isAuthenticated()) {
    return null
  }

  return <>{children}</>
}
