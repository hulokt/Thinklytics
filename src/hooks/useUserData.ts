import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, DATA_TYPES, type DataType } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

interface UseUserDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  upsertData: (newData: T) => Promise<boolean>
  deleteData: () => Promise<boolean>
  refreshData: () => Promise<void>
}

// Type mapping for different data types
type DataTypeMap = {
  [DATA_TYPES.QUESTIONS]: any[]
  [DATA_TYPES.QUIZ_HISTORY]: any[]
  [DATA_TYPES.IN_PROGRESS_QUIZZES]: any[]
  [DATA_TYPES.QUESTION_ANSWERS]: Record<string, any>
  [DATA_TYPES.ALL_QUIZZES]: any[] // New unified quiz array
  [DATA_TYPES.CALENDAR_EVENTS]: any[]
}



export function useUserData<K extends DataType>(
  dataType: K
): UseUserDataResult<DataTypeMap[K]> {
  const { user } = useAuth()
  const [data, setData] = useState<DataTypeMap[K] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Prevent multiple simultaneous requests
  const isLoadingRef = useRef(false)
  const isSavingRef = useRef(false)
  const lastRequestTimeRef = useRef(0)
  const lastSaveTimeRef = useRef(0)
  const retryCountRef = useRef(0)
  const consecutiveFailuresRef = useRef(0)
  const circuitBreakerOpenUntilRef = useRef(0)
  
  // Minimum time between requests (in milliseconds)
  const MIN_REQUEST_INTERVAL = 1000
  const MIN_SAVE_INTERVAL = 10 // Extremely fast for save operations - reduced from 50ms
  const MAX_CONSECUTIVE_FAILURES = 5
  const CIRCUIT_BREAKER_TIMEOUT = 30000 // 30 seconds

  const isCircuitBreakerOpen = () => {
    return Date.now() < circuitBreakerOpenUntilRef.current
  }

  const openCircuitBreaker = () => {
    circuitBreakerOpenUntilRef.current = Date.now() + CIRCUIT_BREAKER_TIMEOUT
    console.warn(`Circuit breaker opened for ${dataType}. Will retry after 30 seconds.`)
  }

  const closeCircuitBreaker = () => {
    consecutiveFailuresRef.current = 0
    circuitBreakerOpenUntilRef.current = 0
  }

  const loadData = useCallback(async (): Promise<void> => {
    if (!user || isLoadingRef.current || isCircuitBreakerOpen()) {
      // Ensure we don't leave UI in a perpetual loading state
      setLoading(false);
      return;
    }
    
    // Throttle requests
    const now = Date.now()
    if (now - lastRequestTimeRef.current < MIN_REQUEST_INTERVAL) {
      return
    }
    
    isLoadingRef.current = true
    lastRequestTimeRef.current = now
    
    try {
      setError(null)
      
      const { data: result, error: fetchError } = await supabase.rpc('get_user_data', {
        p_user_id: user.id,
        p_data_type: dataType
      })

      if (fetchError) {
        throw new Error(`Supabase error: ${fetchError.message}`)
      }

      const parsedData = result || getDefaultData(dataType)
      setData(parsedData)
      retryCountRef.current = 0 // Reset retry count on success
      closeCircuitBreaker() // Close circuit breaker on success
      
    } catch (err: any) {
      console.error(`Error loading ${dataType}:`, err)
      consecutiveFailuresRef.current++
      
      // Open circuit breaker if too many consecutive failures
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        openCircuitBreaker()
        setError(`Too many failed requests for ${dataType}. Temporarily disabled.`)
        setData(getDefaultData(dataType))
        return
      }
      
      // Implement exponential backoff for retries
      retryCountRef.current++
      if (retryCountRef.current <= 3) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000)
        setTimeout(() => {
          isLoadingRef.current = false
          loadData()
        }, retryDelay)
        return
      }
      
      setError(`Failed to load ${dataType}: ${err.message}`)
      // Set default data on error to prevent app crash
      setData(getDefaultData(dataType))
    } finally {
      isLoadingRef.current = false
      setLoading(false)
    }
  }, [user, dataType])

  const upsertData = useCallback(async (newData: DataTypeMap[K]): Promise<boolean> => {
    if (!user || isCircuitBreakerOpen()) {
      return false
    }

    // Update UI immediately for instant feedback
    setData(newData)
    setError(null)

    // If already saving, just queue this update
    if (isSavingRef.current) {
      return true
    }
    
    isSavingRef.current = true
    lastSaveTimeRef.current = Date.now()

    try {
      const { data: result, error: saveError } = await supabase.rpc('upsert_user_data', {
        p_user_id: user.id,
        p_data_type: dataType,
        p_data: newData
      })

      if (saveError) {
        throw new Error(`Supabase error: ${saveError.message}`)
      }

      closeCircuitBreaker() // Close circuit breaker on success
      return true
      
    } catch (err: any) {
      console.error(`❌ Error saving ${dataType}:`, err)
      consecutiveFailuresRef.current++
      
      // Open circuit breaker if too many consecutive failures
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        openCircuitBreaker()
      }
      
      setError(`Failed to save ${dataType}: ${err.message}`)
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [user, dataType])

  const deleteData = useCallback(async (): Promise<boolean> => {
    if (!user || isSavingRef.current) {
      return false
    }

    isSavingRef.current = true

    try {
      setError(null)
      
      const { data: result, error: deleteError } = await supabase.rpc('delete_user_data', {
        p_user_id: user.id,
        p_data_type: dataType
      })

      if (deleteError) {
        throw new Error(`Supabase error: ${deleteError.message}`)
      }

      setData(getDefaultData(dataType))
      return true
      
    } catch (err: any) {
      console.error(`Error deleting ${dataType}:`, err)
      setError(`Failed to delete ${dataType}: ${err.message}`)
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [user, dataType])

  const refreshData = useCallback(async (): Promise<void> => {
    setLoading(true)
    await loadData()
  }, [loadData])

  useEffect(() => {
    if (user) {
      // Add a small delay to prevent immediate multiple calls
      const timer = setTimeout(() => {
        loadData()
      }, 100)
      
      return () => clearTimeout(timer)
    } else {
      setData(null)
      setLoading(false)
      setError(null)
    }
  }, [user, dataType, loadData])

  return {
    data,
    loading,
    error,
    upsertData,
    deleteData,
    refreshData
  }
}

// Helper function to get default data for each type
function getDefaultData(dataType: DataType): any {
  switch (dataType) {
    case DATA_TYPES.QUESTIONS:
    case DATA_TYPES.QUIZ_HISTORY:
    case DATA_TYPES.IN_PROGRESS_QUIZZES:
    case DATA_TYPES.ALL_QUIZZES:
    case DATA_TYPES.CALENDAR_EVENTS:
      return []
    case DATA_TYPES.QUESTION_ANSWERS:
      return {}
    default:
      return null
  }
}

export const useQuestions = () => useUserData(DATA_TYPES.QUESTIONS)
export const useQuizHistory = () => useUserData(DATA_TYPES.QUIZ_HISTORY)
export const useInProgressQuizzes = () => useUserData(DATA_TYPES.IN_PROGRESS_QUIZZES)
export const useQuestionAnswers = () => useUserData(DATA_TYPES.QUESTION_ANSWERS)
export const useAllQuizzes = () => useUserData(DATA_TYPES.ALL_QUIZZES)
export const useCalendarEvents = () => useUserData(DATA_TYPES.CALENDAR_EVENTS) 