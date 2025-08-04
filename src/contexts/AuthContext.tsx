import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User, Session, AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, options?: { data?: any }) => Promise<{ user: User | null; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
    
        } else {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          if (initialSession?.user) {
    
          } else {
    
          }
        }
      } catch (error) {
  
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
  
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, options?: { data?: any }) => {
    try {
  
      
      // Using Vite's injected BASE_URL to respect subfolder deployments (e.g., "/SatLog/")
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const basePath = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
      const redirectUrl = `${window.location.origin}${basePath}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          ...options,
          emailRedirectTo: redirectUrl
        }
      })
      
      if (error) {

        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          return { user: null, error: { ...error, message: 'An account with this email already exists. Please sign in instead.' } as AuthError }
        }
        
        if (error.message.includes('Unable to validate email address')) {
          return { user: null, error: { ...error, message: 'Please enter a valid email address.' } as AuthError }
        }
        
        if (error.message.includes('Password should be at least')) {
          return { user: null, error: { ...error, message: 'Password must be at least 6 characters long.' } as AuthError }
        }
        
        return { user: null, error }
      }
      
      if (data.user) {
        if (!data.session) {
          
        } else {
  
        }
      }
      
      return { user: data.user, error: null }
    } catch (error) {

      return { user: null, error: error as AuthError }
    }
    // Don't set loading to false here - let the auth state change handler do it
  }

  const signIn = async (email: string, password: string) => {
    try {
  
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {

        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          return { user: null, error: { ...error, message: 'Invalid email or password. Please check your credentials and try again.' } as AuthError }
        }
        
        if (error.message.includes('Email not confirmed')) {
          return { user: null, error: { ...error, message: 'Please check your email and click the confirmation link before signing in.' } as AuthError }
        }
        
        return { user: null, error }
      }
      
      
      return { user: data.user, error: null }
    } catch (error) {

      return { user: null, error: error as AuthError }
    }
    // Don't set loading to false here - let the auth state change handler do it
  }

  const signOut = async () => {
    try {
  
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {

        return { error }
      }
      

      return { error: null }
    } catch (error) {

      return { error: error as AuthError }
    }
    // Don't set loading to false here - let the auth state change handler do it
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {

        return { error }
      }
      
      
      return { error: null }
    } catch (error) {

      return { error: error as AuthError }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 