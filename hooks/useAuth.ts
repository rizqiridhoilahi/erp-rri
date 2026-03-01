'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/store/auth'

export interface UseAuthReturn {
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: any) => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: logoutStore } =
    useAuthStore()

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      try {
        // TODO: Replace with actual Supabase auth call
        // const { data, error } = await supabase.auth.signInWithPassword({
        //   email,
        //   password,
        // })
        // if (error) throw error
        // setUser(data.user)

        // Temporary demo login
        console.log('Login with:', { email, password })
        setUser({
          id: 'user-123',
          email,
          name: email.split('@')[0],
          role: 'user',
        })
      } finally {
        setLoading(false)
      }
    },
    [setUser, setLoading]
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true)
      try {
        // TODO: Replace with actual Supabase auth call
        // const { data, error } = await supabase.auth.signUp({
        //   email,
        //   password,
        //   options: {
        //     data: {
        //       name,
        //     },
        //   },
        // })
        // if (error) throw error

        // Temporary demo register
        console.log('Register with:', { name, email, password })
        setUser({
          id: 'user-123',
          email,
          name,
          role: 'user',
        })
      } finally {
        setLoading(false)
      }
    },
    [setUser, setLoading]
  )

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual Supabase auth call
      // await supabase.auth.signOut()
      logoutStore()
    } finally {
      setLoading(false)
    }
  }, [setLoading, logoutStore])

  const resetPassword = useCallback(
    async (email: string) => {
      setLoading(true)
      try {
        // TODO: Replace with actual Supabase auth call
        // const { error } = await supabase.auth.resetPasswordForEmail(email)
        // if (error) throw error
        console.log('Reset password for:', email)
      } finally {
        setLoading(false)
      }
    },
    [setLoading]
  )

  const updateUserProfile = useCallback(
    async (data: any) => {
      setLoading(true)
      try {
        // TODO: Replace with actual Supabase profile update
        // const { error } = await supabase.auth.updateUser(data)
        // if (error) throw error
        // Refetch user
        setUser({
          ...user,
          ...data,
        })
      } finally {
        setLoading(false)
      }
    },
    [setUser, setLoading, user]
  )

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
  }
}
