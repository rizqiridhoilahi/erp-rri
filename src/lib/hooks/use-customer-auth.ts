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
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const t = localStorage.getItem('customer_token')
      if (t) setToken(t)
      setLoading(false)
    })()
  }, [])

  const tryRefresh = useCallback(async () => {
    const rt = localStorage.getItem('customer_refresh_token')
    if (!rt) return false
    try {
      const res = await fetch('/api/v1/public/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      })
      if (!res.ok) return false
      const json = await res.json()
      localStorage.setItem('customer_token', json.data.access_token)
      if (json.data.refresh_token) {
        localStorage.setItem('customer_refresh_token', json.data.refresh_token)
      }
      setToken(json.data.access_token)
      return true
    } catch {
      return false
    }
  }, [])

  const fetchProfile = useCallback(async (t: string) => {
    setProfileLoading(true)
    try {
      const res = await fetch('/api/v1/public/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (!res.ok) {
        const refreshed = await tryRefresh()
        if (!refreshed) {
          localStorage.removeItem('customer_token')
          localStorage.removeItem('customer_refresh_token')
          setToken(null)
          setProfile(null)
        }
        return
      }
      const json = await res.json()
      setProfile(json.data.profile)
    } catch {
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }, [tryRefresh])

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileLoading(false)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null)
      return
    }
    fetchProfile(token)
  }, [token, fetchProfile])

  const logout = useCallback(() => {
    fetch('/api/v1/public/auth/logout', { method: 'POST' }).catch(() => {})
    localStorage.removeItem('customer_token')
    localStorage.removeItem('customer_refresh_token')
    setToken(null)
    setProfile(null)
  }, [])

  return { token, profile, loading, profileLoading, logout, isLoggedIn: !!token && !!profile }
}
