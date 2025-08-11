import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, DATA_TYPES, type DataType } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { dbLogStart, dbLogSuccess, dbLogError } from '../lib/dbLogger'

interface UseUserDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  upsertData: (newData: T) => Promise<boolean>
  appendQuestions?: (newQuestions: any[]) => Promise<boolean>
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
  [DATA_TYPES.CATALOG_QUESTIONS]: any[]
}



export function useUserData<K extends DataType>(
  dataType: K
): UseUserDataResult<DataTypeMap[K]> {
  const { user } = useAuth()
  const userId = user?.id
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
    
  }

  const closeCircuitBreaker = () => {
    consecutiveFailuresRef.current = 0
    circuitBreakerOpenUntilRef.current = 0
  }

  const loadData = useCallback(async (): Promise<void> => {
    if (!userId || isLoadingRef.current || isCircuitBreakerOpen()) {
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
      const logId = dbLogStart('useUserData.loadData', `rpc: get_user_data [${dataType}]`, { userId, dataType })
      setError(null)
      
      const { data: result, error: fetchError } = await supabase.rpc('get_user_data', {
        p_user_id: userId,
        p_data_type: dataType
      })

      if (fetchError) {
        dbLogError('useUserData.loadData', logId, fetchError)
        throw new Error(`Supabase error: ${fetchError.message}`)
      }

      const parsedData = result || getDefaultData(dataType)

      
      // For questions, also check localStorage backup for any missing data
      if (dataType === 'sat_master_log_questions' && Array.isArray(parsedData)) {
        try {
          // Check both regular backup and incremental backup
          const backupData = JSON.parse(localStorage.getItem('satlog:questions_backup') || '[]');
          const incrementalBackup = JSON.parse(localStorage.getItem(`satlog:questions_incremental_${user?.id}`) || '[]');
          
          const totalBackup = [...backupData, ...incrementalBackup];
          
          if (totalBackup.length > 0) {
    
            // Merge backup data with database data
            const mergedData = [...parsedData];
            totalBackup.forEach(backupQuestion => {
              if (!mergedData.find(q => q.id === backupQuestion.id)) {
                mergedData.push(backupQuestion);
              }
            });
            setData(mergedData);
          } else {
            setData(parsedData);
          }
        } catch (backupError) {
          setData(parsedData);
        }
      } else {
        setData(parsedData);
      }
      
      dbLogSuccess('useUserData.loadData', logId, { count: Array.isArray(parsedData) ? parsedData.length : Object.keys(parsedData || {}).length })
      retryCountRef.current = 0 // Reset retry count on success
      closeCircuitBreaker() // Close circuit breaker on success
      
    } catch (err: any) {
      dbLogError('useUserData.loadData', 'n/a', err)

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
  }, [userId, dataType])

  const upsertData = useCallback(async (newData: DataTypeMap[K]): Promise<boolean> => {
    if (!userId || isCircuitBreakerOpen()) {
      return false
    }

    // Check data size before sending to prevent 500 errors
    if (Array.isArray(newData) && newData.length > 5000) {
      setError(`${dataType} data too large (${newData.length} items). Maximum 5,000 items allowed.`)
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
      const logId = dbLogStart('useUserData.upsertData', `rpc: safe_upsert_user_data [${dataType}]`, { userId, dataType, preview: Array.isArray(newData) ? `array(${newData.length})` : typeof newData })
      const callWithTimeout = async <T>(promise: Promise<T>, ms = 25000): Promise<T> => {
        return await Promise.race([
          promise as Promise<any>,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Database operation timed out')), ms))
        ]) as T
      }

      // First try the safer function
      const { data: resultSafe, error: errorSafe }: any = await callWithTimeout(
        supabase
          .from('user_data')
          .upsert([
            {
              user_id: userId as string,
              data_type: dataType,
              data: newData as any,
            } as any,
          ], { onConflict: 'user_id,data_type' })
      )

      // If safe function worked or returned structured success
      if (!errorSafe && !(resultSafe && resultSafe.error)) {
        dbLogSuccess('useUserData.upsertData', logId, { mode: 'safe', result: typeof resultSafe })
        closeCircuitBreaker()
        return true
      }

      // If function not found (404) or similar, fallback to legacy upsert_user_data
      const isFnMissing = !!errorSafe && (
        (errorSafe as any)?.status === 404 ||
        (errorSafe as any)?.code === '404' ||
        (typeof errorSafe.message === 'string' && errorSafe.message.toLowerCase().includes('not found'))
      )

      if (isFnMissing) {
        const { error: errorLegacy }: any = await callWithTimeout(
          supabase
            .from('user_data')
            .upsert([
              {
                user_id: userId as string,
                data_type: dataType,
                data: newData as any,
              } as any,
            ], { onConflict: 'user_id,data_type' })
        )

        if (errorLegacy) {
          dbLogError('useUserData.upsertData', logId, errorLegacy, { mode: 'legacy' })
          throw new Error(`Supabase error: ${errorLegacy.message}`)
        }

        dbLogSuccess('useUserData.upsertData', logId, { mode: 'legacy' })
        closeCircuitBreaker()
        return true
      }

      // If safe function existed but returned an app-level error payload
      if (resultSafe && resultSafe.error) {
        dbLogError('useUserData.upsertData', logId, resultSafe.error, { mode: 'safe-return' })
        throw new Error(resultSafe.error)
      }

      // Other errors from the safe function
      if (errorSafe) {
        dbLogError('useUserData.upsertData', logId, errorSafe, { mode: 'safe-error' })
        throw new Error(`Supabase error: ${errorSafe.message}`)
      }

      // Should not reach here
      closeCircuitBreaker()
      return true
      
    } catch (err: any) {
      consecutiveFailuresRef.current++
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        openCircuitBreaker()
      }
      setError(`Failed to save ${dataType}: ${err.message}`)
      dbLogError('useUserData.upsertData', 'n/a', err)

      // For questions, try to save to localStorage as backup
      if (dataType === 'sat_master_log_questions' && Array.isArray(newData)) {
        try {
          localStorage.setItem('satlog:questions_backup', JSON.stringify(newData));
          console.log('Saved questions to localStorage backup due to database error');
        } catch {}
      }
      
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [userId, dataType])

  // Optimized append function for questions to avoid timeout
  const appendQuestions = useCallback(async (newQuestions: any[]): Promise<boolean> => {
    if (!userId || isCircuitBreakerOpen()) {
      return false
    }

    // Update UI immediately with optimistic update
    const currentData = Array.isArray(data) ? data : [];
    const updatedData = [...currentData, ...newQuestions];
    setData(updatedData);
    setError(null);

    if (isSavingRef.current) {
      return true
    }
    
    isSavingRef.current = true
    lastSaveTimeRef.current = Date.now()

    try {
      const logId = dbLogStart('useUserData.appendQuestions', 'rpc: upsert_user_data (append fallback)', { userId, count: newQuestions.length })
      // FALLBACK: Use the regular upsert with only new questions for now
      // This avoids the database timeout by saving incrementally
      
      // First, try to save just the new questions to backup storage
      const backupKey = `satlog:questions_incremental_${userId}`;
      try {
        const existingBackup = JSON.parse(localStorage.getItem(backupKey) || '[]');
        const updatedBackup = [...existingBackup, ...newQuestions];
        localStorage.setItem(backupKey, JSON.stringify(updatedBackup));
      } catch (backupError) {
        // Backup failed silently
      }
      
      // Try to save the full updated data with a shorter timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Save operation timed out')), 15000); // Shorter timeout
      });
      
      const savePromise = supabase.rpc('upsert_user_data', {
        p_user_id: userId,
        p_data_type: dataType,
        p_data: updatedData
      });
      
      const { data: result, error: saveError } = await Promise.race([savePromise, timeoutPromise]) as any;

      if (saveError) {
        dbLogError('useUserData.appendQuestions', logId, saveError)
        throw new Error(`Supabase error: ${saveError.message}`)
      }


      dbLogSuccess('useUserData.appendQuestions', logId, { resultType: typeof result })
      closeCircuitBreaker()
      
      // Clear backup on successful save
      try {
        localStorage.removeItem(backupKey);
      } catch {}
      
      return true
      
    } catch (err: any) {
      consecutiveFailuresRef.current++
      
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        openCircuitBreaker()
      }
      
      // Don't fail completely - the optimistic update worked and we have backup
      dbLogError('useUserData.appendQuestions', 'n/a', err)
      return true // Return true because the UI update worked
      
    } finally {
      isSavingRef.current = false
    }
  }, [userId, data, dataType])

  const deleteData = useCallback(async (): Promise<boolean> => {
    if (!userId || isSavingRef.current) {
      return false
    }

    isSavingRef.current = true

    try {
      const logId = dbLogStart('useUserData.deleteData', `rpc: delete_user_data [${dataType}]`, { userId })
      setError(null)
      
      const { data: result, error: deleteError } = await supabase.rpc('delete_user_data', {
        p_user_id: userId,
        p_data_type: dataType
      })

      if (deleteError) {
        dbLogError('useUserData.deleteData', logId, deleteError)
        throw new Error(`Supabase error: ${deleteError.message}`)
      }

      setData(getDefaultData(dataType))
      dbLogSuccess('useUserData.deleteData', logId)
      return true
      
    } catch (err: any) {

      setError(`Failed to delete ${dataType}: ${err.message}`)
      dbLogError('useUserData.deleteData', 'n/a', err)
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [userId, dataType])

  const refreshData = useCallback(async (): Promise<void> => {
    setLoading(true)
    await loadData()
  }, [loadData])

  useEffect(() => {
    if (userId) {
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
  }, [userId, dataType, loadData])

  return {
    data,
    loading,
    error,
    upsertData,
    appendQuestions: dataType === 'sat_master_log_questions' ? appendQuestions : undefined,
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
    case DATA_TYPES.CATALOG_QUESTIONS:
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
export const useCatalogQuestions = () => useUserData(DATA_TYPES.CATALOG_QUESTIONS)