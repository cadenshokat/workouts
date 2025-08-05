// src/components/ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type Role = 'basic' | 'elevated'

interface ProtectedRouteProps {
  allowedRoles: Role[]            // which tiers may see this page
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { loading, session, role } = useAuth()

  if (loading) {
    return <div>Loading…</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!role || !allowedRoles.includes(role as Role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
