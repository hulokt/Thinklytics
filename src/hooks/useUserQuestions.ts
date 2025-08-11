import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { dbLogStart, dbLogSuccess, dbLogError } from '../lib/dbLogger'
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
  bulkAddQuestions: (questions: Omit<UserQuestion, 'id' | 'user_id' | 'createdAt' | 'lastUpdated'>[]) => Promise<boolean>
  updateQuestion: (id: string, updates: Partial<UserQuestion>) => Promise<boolean>
  deleteQuestion: (id: string) => Promise<boolean>
  bulkDeleteQuestions: (ids: string[]) => Promise<boolean>
  deleteAllQuestions: () => Promise<boolean>
  refreshData: () => Promise<void>
}

export function useUserQuestions(): UseUserQuestionsResult {
  const { user } = useAuth()
  const userId = user?.id
  const [data, setData] = useState<UserQuestion[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isLoadingRef = useRef(false)
  // Feature-detect whether the project has the new user_questions table
  const supportsTableRef = useRef(true)
  
  const loadData = useCallback(async () => {
    if (!userId || isLoadingRef.current) {
      return
    }

    isLoadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const startId = dbLogStart('useUserQuestions.loadData', supportsTableRef.current ? 'table: user_questions select' : 'rpc: get_user_data', { userId })
      // Try to use the new table-based approach first (only if supported)
      if (supportsTableRef.current) {
        const { data: tableData, error: tableError } = await supabase
          .from('user_questions')
          .select('*')
          .eq('user_id', userId)
          .order('createdat', { ascending: false })

        if (!tableError && tableData) {
          dbLogSuccess('useUserQuestions.loadData', startId, { mode: 'table', count: tableData.length })
          // Convert table data to the expected format
          const questions = tableData.map((row: any) => ({
            id: row.id,
            user_id: row.user_id,
            origin: row.origin,
            section: row.section,
            domain: row.domain,
            questionType: row.questiontype,
            passageText: row.passagetext,
            passageImage: row.passageimage,
            questionText: row.questiontext,
            answerChoices: row.answerchoices,
            correctAnswer: row.correctanswer,
            explanation: row.explanation,
            explanationImage: row.explanationimage,
            difficulty: row.difficulty,
            hidden: row.hidden,
            createdAt: row.createdat,
            lastUpdated: row.lastupdated
          }))
          setData(questions)
          return
        }

        // If the table call errored, disable table path going forward
        if (tableError) {
          dbLogError('useUserQuestions.loadData', startId, tableError, { mode: 'table' })
          supportsTableRef.current = false
        }
      }

      // Fallback to JSONB approach
      const { data: jsonbData, error: fetchError } = await supabase.rpc('get_user_data', {
        p_user_id: userId,
        p_data_type: 'sat_master_log_questions'
      })

      if (fetchError) {
        dbLogError('useUserQuestions.loadData', startId, fetchError, { mode: 'jsonb' })
        throw new Error(`Database error: ${fetchError.message}`)
      }

      dbLogSuccess('useUserQuestions.loadData', startId, { mode: 'jsonb', count: Array.isArray(jsonbData) ? jsonbData.length : null })
      const questions = Array.isArray(jsonbData) ? jsonbData : []
      setData(questions)
      
    } catch (err: any) {
      dbLogError('useUserQuestions.loadData', 'n/a', err)
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
      const startId = dbLogStart('useUserQuestions.addQuestion', supportsTableRef.current ? 'table: insert user_questions' : 'rpc: upsert_user_data', { userId })
      // Optimistic update
      setData(prev => prev ? [newQuestion, ...prev] : [newQuestion])
      
      // Use the new table-based approach for single questions when available
      let insertError: any = null
      if (supportsTableRef.current) {
        const { error } = await supabase
          .from('user_questions')
          .insert([{
            id: newQuestion.id,
            user_id: newQuestion.user_id,
            origin: newQuestion.origin || 'user',
            section: newQuestion.section,
            domain: newQuestion.domain,
            questiontype: newQuestion.questionType,
            passagetext: newQuestion.passageText,
            passageimage: newQuestion.passageImage,
            questiontext: newQuestion.questionText,
            answerchoices: newQuestion.answerChoices,
            correctanswer: newQuestion.correctAnswer,
            explanation: newQuestion.explanation,
            explanationimage: newQuestion.explanationImage,
            difficulty: newQuestion.difficulty,
            hidden: newQuestion.hidden || false,
            createdat: newQuestion.createdAt,
            lastupdated: newQuestion.lastUpdated
          }])
        insertError = error
        if (insertError) {
          supportsTableRef.current = false
          dbLogError('useUserQuestions.addQuestion', startId, insertError, { mode: 'table' })
        } else {
          dbLogSuccess('useUserQuestions.addQuestion', startId, { mode: 'table' })
        }
      } else {
        insertError = { message: 'table disabled' }
      }

      if (insertError) {
        // Fallback to JSONB approach if table doesn't exist
        const currentData = Array.isArray(data) ? data : []
        const updatedData = [newQuestion, ...currentData]
        const { error: upsertError } = await supabase
          .from('user_data')
          .upsert([
            {
              user_id: userId as string,
              data_type: 'sat_master_log_questions',
              data: updatedData,
            } as any,
          ], { onConflict: 'user_id,data_type' })
        if (upsertError) {
          dbLogError('useUserQuestions.addQuestion', startId, upsertError, { mode: 'jsonb' })
          throw new Error(`Database upsert error: ${upsertError.message}`)
        }
        dbLogSuccess('useUserQuestions.addQuestion', startId, { mode: 'jsonb' })
      }

      return true
      
    } catch (err: any) {
      dbLogError('useUserQuestions.addQuestion', 'n/a', err)
      // Revert optimistic update on failure
      setData(prev => prev ? prev.filter(q => q.id !== questionId) : [])
      setError(`Failed to add question: ${err.message}`)
      return false
    }
  }, [userId, data])

  const updateQuestion = useCallback(async (id: string, updates: Partial<UserQuestion>): Promise<boolean> => {
    if (!userId) return false

    try {
      const startId = dbLogStart('useUserQuestions.updateQuestion', supportsTableRef.current ? 'table: update user_questions' : 'rpc: upsert_user_data', { id, userId })
      const updateData = {
        ...updates,
        lastUpdated: new Date().toISOString(),
      }
      
      // Optimistic update
      setData(prev => prev ? prev.map(q => 
        q.id === id ? { ...q, ...updateData } : q
      ) : [])
      
      // Use table-based update
      let updateError: any = null
      if (supportsTableRef.current) {
        const { error } = await supabase
          .from('user_questions')
          .update({
            origin: updateData.origin,
            section: updateData.section,
            domain: updateData.domain,
            questiontype: updateData.questionType,
            passagetext: updateData.passageText,
            passageimage: updateData.passageImage,
            questiontext: updateData.questionText,
            answerchoices: updateData.answerChoices,
            correctanswer: updateData.correctAnswer,
            explanation: updateData.explanation,
            explanationimage: updateData.explanationImage,
            difficulty: updateData.difficulty,
            hidden: updateData.hidden,
            lastupdated: updateData.lastUpdated
          })
          .eq('id', id)
          .eq('user_id', userId)
        updateError = error
        if (updateError) {
          supportsTableRef.current = false
          dbLogError('useUserQuestions.updateQuestion', startId, updateError, { mode: 'table' })
        } else {
          dbLogSuccess('useUserQuestions.updateQuestion', startId, { mode: 'table' })
        }
      } else {
        updateError = { message: 'table disabled' }
      }

      if (updateError) {
        // Fallback to JSONB approach
        const currentData = Array.isArray(data) ? data : []
        const updatedData = currentData.map(q => 
          q.id === id ? { ...q, ...updateData } : q
        )
        const { error: upsertError } = await supabase
          .from('user_data')
          .upsert([
            {
              user_id: userId as string,
              data_type: 'sat_master_log_questions',
              data: updatedData,
            } as any,
          ], { onConflict: 'user_id,data_type' })
        if (upsertError) {
          dbLogError('useUserQuestions.updateQuestion', startId, upsertError, { mode: 'jsonb' })
          throw new Error(`Database upsert error: ${upsertError.message}`)
        }
        dbLogSuccess('useUserQuestions.updateQuestion', startId, { mode: 'jsonb' })
      }

      return true
      
    } catch (err: any) {
      dbLogError('useUserQuestions.updateQuestion', 'n/a', err)
      // Reload data on failure to revert optimistic update
      await loadData()
      setError(`Failed to update question: ${err.message}`)
      return false
    }
  }, [userId, loadData, data])

  const deleteQuestion = useCallback(async (id: string): Promise<boolean> => {
    if (!userId) return false

    try {
      const startId = dbLogStart('useUserQuestions.deleteQuestion', supportsTableRef.current ? 'table: delete user_questions by id' : 'rpc: upsert_user_data', { id, userId })
      // Optimistic update
      const prevData = Array.isArray(data) ? data : []
      setData(prev => prev ? prev.filter(q => q.id !== id) : [])
      
      // Use table-based delete
      let deleteError: any = null
      if (supportsTableRef.current) {
        const { error } = await supabase
          .from('user_questions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)
        deleteError = error
        if (deleteError) {
          supportsTableRef.current = false
          dbLogError('useUserQuestions.deleteQuestion', startId, deleteError, { mode: 'table' })
        } else {
          dbLogSuccess('useUserQuestions.deleteQuestion', startId, { mode: 'table' })
        }
      } else {
        deleteError = { message: 'table disabled' }
      }

      if (deleteError) {
        // Fallback to JSONB approach
        const updatedData = prevData.filter(q => q.id !== id)
        const { error: upsertError } = await supabase
          .from('user_data')
          .upsert([
            {
              user_id: userId as string,
              data_type: 'sat_master_log_questions',
              data: updatedData,
            } as any,
          ], { onConflict: 'user_id,data_type' })
        if (upsertError) {
          dbLogError('useUserQuestions.deleteQuestion', startId, upsertError, { mode: 'jsonb' })
          throw new Error(`Database upsert error: ${upsertError.message}`)
        }
        dbLogSuccess('useUserQuestions.deleteQuestion', startId, { mode: 'jsonb' })
      }

      return true
      
    } catch (err: any) {
      dbLogError('useUserQuestions.deleteQuestion', 'n/a', err)
      // Revert optimistic update on failure
      await loadData()
      setError(`Failed to delete question: ${err.message}`)
      return false
    }
  }, [userId, loadData, data])

  const bulkDeleteQuestions = useCallback(async (ids: string[]): Promise<boolean> => {
    if (!userId || ids.length === 0) return false

    try {
      const startId = dbLogStart('useUserQuestions.bulkDeleteQuestions', supportsTableRef.current ? 'table: delete.in ids user_questions' : 'rpc: upsert_user_data', { idsCount: ids.length, userId })
      // Optimistic update
      setData(prev => prev ? prev.filter(q => !ids.includes(q.id)) : [])
      
      // Use table-based bulk delete
      let deleteError: any = null
      if (supportsTableRef.current) {
        const { error } = await supabase
          .from('user_questions')
          .delete()
          .in('id', ids)
          .eq('user_id', userId)
        deleteError = error
        if (deleteError) {
          supportsTableRef.current = false
          dbLogError('useUserQuestions.bulkDeleteQuestions', startId, deleteError, { mode: 'table' })
        } else {
          dbLogSuccess('useUserQuestions.bulkDeleteQuestions', startId, { mode: 'table' })
        }
      } else {
        deleteError = { message: 'table disabled' }
      }

      if (deleteError) {
        // Fallback to JSONB approach
        const currentData = Array.isArray(data) ? data : []
        const updatedData = currentData.filter(q => !ids.includes(q.id))
        
        const { error: upsertError } = await supabase
          .from('user_data')
          .upsert([
            {
              user_id: userId as string,
              data_type: 'sat_master_log_questions',
              data: updatedData,
            } as any,
          ], { onConflict: 'user_id,data_type' })

        if (upsertError) {
          dbLogError('useUserQuestions.bulkDeleteQuestions', startId, upsertError, { mode: 'jsonb' })
          throw new Error(`Database upsert error: ${upsertError.message}`)
        }
        dbLogSuccess('useUserQuestions.bulkDeleteQuestions', startId, { mode: 'jsonb' })
      }

      return true
      
    } catch (err: any) {
      dbLogError('useUserQuestions.bulkDeleteQuestions', 'n/a', err)
      // Reload data on failure to revert optimistic update
      await loadData()
      setError(`Failed to delete questions: ${err.message}`)
      return false
    }
  }, [userId, loadData, data])

  const bulkAddQuestions = useCallback(async (questions: Omit<UserQuestion, 'id' | 'user_id' | 'createdAt' | 'lastUpdated'>[]): Promise<boolean> => {
    if (!userId || questions.length === 0) return false

    try {
      const startId = dbLogStart('useUserQuestions.bulkAddQuestions', supportsTableRef.current ? 'table: insert many user_questions' : 'rpc: upsert_user_data', { count: questions.length, userId })
      const now = new Date().toISOString()
      const questionsWithIds = questions.map((question, index) => ({
        ...question,
        id: `${Date.now()}-${Math.floor(Math.random() * 1000000)}-${index}`,
        user_id: userId,
        createdAt: now,
        lastUpdated: now,
      }))

      // Optimistic update
      setData(prev => prev ? [...questionsWithIds, ...prev] : questionsWithIds)
      
      // Use table-based bulk insert
      let insertError: any = null
      if (supportsTableRef.current) {
        const insertData = questionsWithIds.map(q => ({
          id: q.id,
          user_id: q.user_id,
          origin: q.origin || 'user',
          section: q.section,
          domain: q.domain,
          questiontype: q.questionType,
          passagetext: q.passageText,
          passageimage: q.passageImage,
          questiontext: q.questionText,
          answerchoices: q.answerChoices,
          correctanswer: q.correctAnswer,
          explanation: q.explanation,
          explanationimage: q.explanationImage,
          difficulty: q.difficulty,
          hidden: q.hidden || false,
          createdat: q.createdAt,
          lastupdated: q.lastUpdated
        }))

        const { error } = await supabase
          .from('user_questions')
          .insert(insertData)
        insertError = error
        if (insertError) {
          supportsTableRef.current = false
          dbLogError('useUserQuestions.bulkAddQuestions', startId, insertError, { mode: 'table' })
        } else {
          dbLogSuccess('useUserQuestions.bulkAddQuestions', startId, { mode: 'table', inserted: insertData.length })
        }
      } else {
        insertError = { message: 'table disabled' }
      }

      if (insertError) {
        // Fallback to JSONB approach
        const currentData = Array.isArray(data) ? data : []
        const updatedData = [...questionsWithIds, ...currentData]
        const { error: upsertError } = await supabase.rpc('upsert_user_data', {
          p_user_id: userId,
          p_data_type: 'sat_master_log_questions',
          p_data: updatedData
        })
        if (upsertError) {
          dbLogError('useUserQuestions.bulkAddQuestions', startId, upsertError, { mode: 'jsonb' })
          throw new Error(`Database upsert error: ${upsertError.message}`)
        }
        dbLogSuccess('useUserQuestions.bulkAddQuestions', startId, { mode: 'jsonb', total: updatedData.length })
      }

      return true
      
    } catch (err: any) {
      dbLogError('useUserQuestions.bulkAddQuestions', 'n/a', err)
      // Revert optimistic update on failure
      await loadData()
      setError(`Failed to add questions: ${err.message}`)
      return false
    }
  }, [userId, loadData, data])

  const deleteAllQuestions = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

    try {
      const startId = dbLogStart('useUserQuestions.deleteAllQuestions', supportsTableRef.current ? 'table: delete all user_questions' : 'rpc: delete_user_data / upsert empty', { userId })
      // Optimistic update
      setData([])
      
      // Use table-based delete all
      let deleteError: any = null
      if (supportsTableRef.current) {
        const { error } = await supabase
          .from('user_questions')
          .delete()
          .eq('user_id', userId)
        deleteError = error
        if (deleteError) {
          supportsTableRef.current = false
          dbLogError('useUserQuestions.deleteAllQuestions', startId, deleteError, { mode: 'table' })
        } else {
          dbLogSuccess('useUserQuestions.deleteAllQuestions', startId, { mode: 'table' })
        }
      } else {
        deleteError = { message: 'table disabled' }
      }

      if (deleteError) {
        // Fallback to JSONB approach - try RPC first
        const { error: deleteDataError } = await supabase
          .from('user_data')
          .delete()
          .eq('user_id', userId as string)
          .eq('data_type', 'sat_master_log_questions')
        if (deleteDataError) {
          // Final fallback: upsert empty array to effectively clear
          const { error: clearError } = await supabase
            .from('user_data')
            .upsert([
              {
                user_id: userId as string,
                data_type: 'sat_master_log_questions',
                data: [],
              } as any,
            ], { onConflict: 'user_id,data_type' })
          if (clearError) {
            dbLogError('useUserQuestions.deleteAllQuestions', startId, clearError, { mode: 'jsonb', step: 'fallback upsert empty', deleteErr: deleteDataError?.message })
            throw new Error(`Database delete error: ${deleteDataError.message}; fallback upsert error: ${clearError.message}`)
          }
        }
        dbLogSuccess('useUserQuestions.deleteAllQuestions', startId, { mode: 'jsonb' })
      }

      return true
      
    } catch (err: any) {
      dbLogError('useUserQuestions.deleteAllQuestions', 'n/a', err)
      // Revert optimistic update on failure
      await loadData()
      setError(`Failed to delete all questions: ${err.message}`)
      return false
    }
  }, [userId, loadData])

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
    bulkAddQuestions,
    updateQuestion,
    deleteQuestion,
    bulkDeleteQuestions,
    deleteAllQuestions,
    refreshData
  }
}
