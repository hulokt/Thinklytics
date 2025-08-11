import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

interface UserQuestion {
  id: string
  user_id: string
  origin?: string
  section?: string
  domain?: string
  questionType?: string
  passageText?: string
  passageImage?: string | null
  questionText?: string
  answerChoices?: Record<string, string>
  correctAnswer?: string
  explanation?: string
  explanationImage?: string | null
  difficulty?: string
  hidden?: boolean
  createdAt?: string
  lastUpdated?: string
}

interface UseUserQuestionsResult {
  data: UserQuestion[] | null
  loading: boolean
  error: string | null
  addQuestion: (question: Omit<UserQuestion, 'id' | 'user_id' | 'createdAt' | 'lastUpdated'>) => Promise<boolean>
  updateQuestion: (id: string, updates: Partial<UserQuestion>) => Promise<boolean>
  deleteQuestion: (id: string) => Promise<boolean>
  bulkDeleteQuestions: (ids: string[]) => Promise<boolean>
  refreshData: () => Promise<void>
}

export function useUserQuestions(): UseUserQuestionsResult {
  const { user } = useAuth()
  const userId = user?.id
  const [data, setData] = useState<UserQuestion[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isLoadingRef = useRef(false)
  
  const loadData = useCallback(async () => {
    if (!userId || isLoadingRef.current) {
      return
    }

    isLoadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      // Use the existing sat_master_log_questions data
      const { data: jsonbData, error: fetchError } = await supabase.rpc('get_user_data', {
        p_user_id: userId,
        p_data_type: 'sat_master_log_questions'
      })

      if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`)
      }

      const questions = Array.isArray(jsonbData) ? jsonbData : []
      setData(questions)
      
    } catch (err: any) {
      setError(`Failed to load questions: ${err.message}`)
      setData([])
    } finally {
      isLoadingRef.current = false
      setLoading(false)
    }
  }, [userId])

  const addQuestion = useCallback(async (question: Omit<UserQuestion, 'id' | 'user_id' | 'createdAt' | 'lastUpdated'>): Promise<boolean> => {
    if (!userId) {
      return false
    }

    const questionId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`
    const now = new Date().toISOString()
    
    const newQuestion: UserQuestion = {
      ...question,
      id: questionId,
      user_id: userId,
      createdAt: now,
      lastUpdated: now,
    }

    try {
      // Optimistic update
      setData(prev => prev ? [newQuestion, ...prev] : [newQuestion])
      
      // Append just the new question to avoid sending the full array
      const { error: appendError }: any = await supabase.rpc('append_user_questions', {
        p_user_id: userId,
        p_questions: [newQuestion]
      })

      // If append function doesn't exist in the DB, fallback to full upsert
      if (appendError) {
        const isFnMissing = (appendError?.status === 404) ||
          (appendError?.code === '404') ||
          (typeof appendError.message === 'string' && appendError.message.toLowerCase().includes('not found'))

        if (isFnMissing) {
          const currentData = Array.isArray(data) ? data : []
          const updatedData = [newQuestion, ...currentData]
          const { error: upsertError } = await supabase.rpc('upsert_user_data', {
            p_user_id: userId,
            p_data_type: 'sat_master_log_questions',
            p_data: updatedData
          })
          if (upsertError) {
            throw new Error(`Database upsert error: ${upsertError.message}`)
          }
        } else {
          throw new Error(`Database append error: ${appendError.message}`)
        }
      }

      return true
      
    } catch (err: any) {
      // Revert optimistic update on failure
      setData(prev => prev ? prev.filter(q => q.id !== questionId) : [])
      setError(`Failed to add question: ${err.message}`)
      return false
    }
  }, [userId, data])

  const updateQuestion = useCallback(async (id: string, updates: Partial<UserQuestion>): Promise<boolean> => {
    if (!userId) return false

    try {
      const updateData = {
        ...updates,
        lastUpdated: new Date().toISOString(),
      }
      
      // Optimistic update
      setData(prev => prev ? prev.map(q => 
        q.id === id ? { ...q, ...updateData } : q
      ) : [])
      
      // Prefer lightweight RPC to update only one question server-side
      const { error: updateOneError }: any = await supabase.rpc('update_user_question', {
        p_user_id: userId,
        p_question: { id, ...updateData }
      })

      if (updateOneError) {
        const isFnMissing = (updateOneError?.status === 404) ||
          (updateOneError?.code === '404') ||
          (typeof updateOneError.message === 'string' && updateOneError.message.toLowerCase().includes('not found'))
        
        if (isFnMissing) {
          // Fallback to full-array upsert if the RPC doesn't exist on the DB yet
          const currentData = Array.isArray(data) ? data : []
          const updatedData = currentData.map(q => 
            q.id === id ? { ...q, ...updateData } : q
          )
          const { error: upsertError } = await supabase.rpc('upsert_user_data', {
            p_user_id: userId,
            p_data_type: 'sat_master_log_questions',
            p_data: updatedData
          })
          if (upsertError) {
            throw new Error(`Database upsert error: ${upsertError.message}`)
          }
        } else {
          throw new Error(`Database update error: ${updateOneError.message}`)
        }
      }

      return true
      
    } catch (err: any) {
      // Reload data on failure to revert optimistic update
      await loadData()
      setError(`Failed to update question: ${err.message}`)
      return false
    }
  }, [userId, loadData, data])

  const deleteQuestion = useCallback(async (id: string): Promise<boolean> => {
    if (!userId) return false

    try {
      // Optimistic update
      const prevData = Array.isArray(data) ? data : []
      setData(prev => prev ? prev.filter(q => q.id !== id) : [])
      
      // Prefer lightweight RPC on server to avoid sending full payload
      const { error: removeError }: any = await supabase.rpc('remove_user_question', {
        p_user_id: userId,
        p_question_id: id
      })

      if (removeError) {
        const isFnMissing = (removeError?.status === 404) ||
          (removeError?.code === '404') ||
          (typeof removeError.message === 'string' && removeError.message.toLowerCase().includes('not found'))
        
        if (isFnMissing) {
          // Fallback to full-array upsert
          const updatedData = prevData.filter(q => q.id !== id)
          const { error: upsertError } = await supabase.rpc('upsert_user_data', {
            p_user_id: userId,
            p_data_type: 'sat_master_log_questions',
            p_data: updatedData
          })
          if (upsertError) {
            throw new Error(`Database upsert error: ${upsertError.message}`)
          }
        } else {
          throw new Error(`Database remove error: ${removeError.message}`)
        }
      }

      return true
      
    } catch (err: any) {
      // Revert optimistic update on failure
      await loadData()
      setError(`Failed to delete question: ${err.message}`)
      return false
    }
  }, [userId, loadData, data])

  const bulkDeleteQuestions = useCallback(async (ids: string[]): Promise<boolean> => {
    if (!userId || ids.length === 0) return false

    try {
      // Optimistic update
      setData(prev => prev ? prev.filter(q => !ids.includes(q.id)) : [])
      
      // Persist by replacing the whole array (bulk)
      const currentData = Array.isArray(data) ? data : []
      const updatedData = currentData.filter(q => !ids.includes(q.id))
      
      const { error: upsertError } = await supabase.rpc('upsert_user_data', {
        p_user_id: userId,
        p_data_type: 'sat_master_log_questions',
        p_data: updatedData
      })

      if (upsertError) {
        throw new Error(`Database upsert error: ${upsertError.message}`)
      }

      return true
      
    } catch (err: any) {
      // Reload data on failure to revert optimistic update
      await loadData()
      setError(`Failed to delete questions: ${err.message}`)
      return false
    }
  }, [userId, loadData, data])

  const migrateFromJsonb = useCallback(async (): Promise<boolean> => {
    // Migration not needed since we only use the database
    return true
  }, [])

  const refreshData = useCallback(async (): Promise<void> => {
    await loadData()
  }, [loadData])

  useEffect(() => {
    if (userId) {
      // Avoid unnecessary loading flicker when tab regains focus by deferring to next tick
      const timer = setTimeout(() => {
        loadData()
      }, 0)
      return () => clearTimeout(timer)
    } else {
      setData(null)
      setLoading(false)
      setError(null)
    }
  }, [userId, loadData])

  return {
    data,
    loading,
    error,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    bulkDeleteQuestions,
    refreshData
  }
}
