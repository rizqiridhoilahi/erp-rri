'use client'

import { useState, useEffect, useCallback } from 'react'

interface CustomerProfile {
  id: string
  auth_user_id: string
  customer_id: string | null
  nama_perusahaan: string
  penanggung_jawab_pic: string
  status_verifikasi: string
}

export function useCustomerAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const t = localStorage.getItem('customer_token')
      if (t) setToken(t)
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (!token) {
      ;(async () => {
        setProfile(null)
      })()
      return
    }
    ;(async () => {
      try {
        const res = await fetch('/api/v1/public/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          localStorage.removeItem('customer_token')
          localStorage.removeItem('customer_refresh_token')
          setToken(null)
          setProfile(null)
          return
        }
        const json = await res.json()
        setProfile(json.data.profile)
      } catch {
        setProfile(null)
      }
    })()
  }, [token])

  const logout = useCallback(() => {
    localStorage.removeItem('customer_token')
    localStorage.removeItem('customer_refresh_token')
    setToken(null)
    setProfile(null)
  }, [])

  return { token, profile, loading, logout, isLoggedIn: !!token && !!profile }
}
