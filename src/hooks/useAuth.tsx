import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../integrations/supabase/client'

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  role: string | null
}

const AuthContext = createContext<AuthContextType>({ session: null, user: null, loading: true, role: null })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser]       = useState<User | null>(null)
  const [role, setRole]       = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)

      if (session?.user.id) {
        supabase
          .from('users')
          .upsert({ id: session.user.id })
          .then(() => {
            return supabase
              .from('users')
              .select('tier')
              .eq('id', session.user.id)
              .single()
          })
          .then(({ data }) => setRole(data?.tier ?? 'basic'))
      }
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user.id) {
              supabase
                .from('users')
                .upsert({ id: session.user.id })
                .then(() => {
                  return supabase
                    .from('users')
                    .select('tier')
                    .eq('id', session.user.id)
                    .single()
                })
                .then(({ data }) => setRole(data?.tier ?? 'basic'))
            } else {
              setRole(null)
            }

        }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: user, loading, role: role }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 