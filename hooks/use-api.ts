import { useState, useCallback } from 'react'
import { getApiUrl } from '@/lib/config'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const fetchData = useCallback(async (url: string, options?: RequestInit) => {
    const apiUrl = getApiUrl(url)
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      })
      
      const result: ApiResponse<T> = await response.json()
      
      if (result.success) {
        setState({
          data: result.data || null,
          loading: false,
          error: null
        })
        return result.data
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'حدث خطأ غير متوقع'
        })
        throw new Error(result.error || 'حدث خطأ غير متوقع')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'حدث خطأ في الاتصال'
      setState({
        data: null,
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }, [])

  const postData = useCallback(async <D = any>(url: string, data: D) => {
    const apiUrl = getApiUrl(url)
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result: ApiResponse<T> = await response.json()
      
      if (result.success) {
        setState({
          data: result.data || null,
          loading: false,
          error: null
        })
        return result.data
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'حدث خطأ غير متوقع'
        })
        throw new Error(result.error || 'حدث خطأ غير متوقع')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'حدث خطأ في الاتصال'
      setState({
        data: null,
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }, [])

  const putData = useCallback(async <D = any>(url: string, data: D) => {
    const apiUrl = getApiUrl(url)
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result: ApiResponse<T> = await response.json()
      
      if (result.success) {
        setState({
          data: result.data || null,
          loading: false,
          error: null
        })
        return result.data
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'حدث خطأ غير متوقع'
        })
        throw new Error(result.error || 'حدث خطأ غير متوقع')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'حدث خطأ في الاتصال'
      setState({
        data: null,
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }, [])

  const deleteData = useCallback(async (url: string) => {
    const apiUrl = getApiUrl(url)
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result: ApiResponse<T> = await response.json()
      
      if (result.success) {
        setState({
          data: result.data || null,
          loading: false,
          error: null
        })
        return result.data
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'حدث خطأ غير متوقع'
        })
        throw new Error(result.error || 'حدث خطأ غير متوقع')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'حدث خطأ في الاتصال'
      setState({
        data: null,
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    fetchData,
    postData,
    putData,
    deleteData,
    reset
  }
} 