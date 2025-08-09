import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface CatalogQuestion {
  id: string
  origin?: string
  section?: string
  domain?: string
  questionType?: string
  passageText?: string
  passageImage?: string | null
  questionText?: string
  answerChoices?: { A?: string; B?: string; C?: string; D?: string }
  correctAnswer?: string
  explanation?: string
  explanationImage?: string | null
  difficulty?: string
  hidden?: boolean
  createdAt?: string
  lastUpdated?: string
}

type UseGlobalCatalogResult = {
  data: CatalogQuestion[] | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  addQuestions: (q: CatalogQuestion | CatalogQuestion[]) => Promise<boolean>
  updateQuestion: (id: string, patch: Partial<CatalogQuestion>) => Promise<boolean>
  deleteQuestion: (id: string) => Promise<boolean>
  bulkDeleteQuestions: (ids: string[]) => Promise<boolean>
}

export function useGlobalCatalogQuestions(): UseGlobalCatalogResult {
  const [data, setData] = useState<CatalogQuestion[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const toDb = (q: Partial<CatalogQuestion>) => ({
    id: q.id,
    origin: q.origin ?? 'catalog',
    section: q.section,
    domain: q.domain,
    questiontype: q.questionType,
    passagetext: q.passageText,
    passageimage: q.passageImage,
    questiontext: q.questionText,
    answerchoices: q.answerChoices as any,
    correctanswer: q.correctAnswer,
    explanation: q.explanation,
    explanationimage: q.explanationImage,
    difficulty: q.difficulty,
    hidden: q.hidden ?? false,
  })

  const fromDb = (r: any): CatalogQuestion => ({
    id: r.id,
    origin: r.origin,
    section: r.section,
    domain: r.domain,
    questionType: r.questiontype,
    passageText: r.passagetext,
    passageImage: r.passageimage,
    questionText: r.questiontext,
    answerChoices: r.answerchoices,
    correctAnswer: r.correctanswer,
    explanation: r.explanation,
    explanationImage: r.explanationimage,
    difficulty: r.difficulty,
    hidden: r.hidden,
    createdAt: r.createdat,
    lastUpdated: r.lastupdated,
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: rows, error: err } = await supabase
      .from('catalog_questions')
      .select('*')
      .order('createdat', { ascending: false })

    if (err) {
      setError(err.message)
      setData([])
    } else {
      setData((rows || []).map(fromDb))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Realtime sync
  const channelRef = useRef<any | null>(null)

  useEffect(() => {
    // Ensure no duplicate subscriptions by cleaning any existing channel first
    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current) } catch {}
      channelRef.current = null
    }

    const uniqueName = `catalog_questions_changes_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(uniqueName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catalog_questions' }, payload => {
        setData(prev => {
          const current = Array.isArray(prev) ? [...prev] : []
          const row = payload.new ? fromDb(payload.new) : null
          const old = payload.old ? fromDb(payload.old) : null
          if (payload.eventType === 'INSERT') {
            if (row) {
              const idx = current.findIndex(q => q.id === row.id)
              if (idx >= 0) current[idx] = row
              else current.unshift(row)
            }
          } else if (payload.eventType === 'UPDATE') {
            if (row) {
              const idx = current.findIndex(q => q.id === row.id)
              if (idx >= 0) current[idx] = row
            }
          } else if (payload.eventType === 'DELETE') {
            const idx = current.findIndex(q => q.id === (old?.id || ''))
            if (idx >= 0) current.splice(idx, 1)
          }
          return current
        })
      })

    channel.subscribe()
    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current) } catch {}
        channelRef.current = null
      }
    }
  }, [])

  const ensureId = (q: Partial<CatalogQuestion>, index = 0): string => {
    return q.id || `catalog-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${index}`
  }

  const addQuestions = useCallback<UseGlobalCatalogResult['addQuestions']>(async (q) => {
    const incoming = Array.isArray(q) ? q : [q]
    const rows = incoming.map((it, i) => toDb({ ...it, id: ensureId(it, i) }))

    const { error: err } = await supabase
      .from('catalog_questions')
      .upsert(rows, { onConflict: 'id' })

    if (err) {
      setError(err.message)
      return false
    }
    // Optimistic local update if realtime isn't enabled
    setData(prev => {
      const current = Array.isArray(prev) ? [...prev] : []
      // De-dup by id
      const map = new Map<string, CatalogQuestion>()
      current.forEach(r => map.set(r.id, r))
      const nowIso = new Date().toISOString()
      rows.forEach(rdb => {
        const r = fromDb({ ...rdb, createdat: nowIso, lastupdated: nowIso })
        map.set(r.id, r)
      })
      // Keep newest first by lastUpdated
      return Array.from(map.values()).sort((a,b)=>
        new Date(b.lastUpdated || '').getTime() - new Date(a.lastUpdated || '').getTime()
      )
    })
    return true
  }, [])

  const updateQuestion = useCallback<UseGlobalCatalogResult['updateQuestion']>(async (id, patch) => {
    const dbPatch = toDb({ ...patch, id })
    const { error: err } = await supabase
      .from('catalog_questions')
      .update(dbPatch)
      .eq('id', id)

    if (err) {
      setError(err.message)
      return false
    }
    setData(prev => {
      const current = Array.isArray(prev) ? [...prev] : []
      const idx = current.findIndex(q => q.id === id)
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...patch, origin: 'catalog', lastUpdated: new Date().toISOString() }
      }
      return current
    })
    return true
  }, [])

  const deleteQuestion = useCallback<UseGlobalCatalogResult['deleteQuestion']>(async (id) => {
    const { error: err } = await supabase
      .from('catalog_questions')
      .delete()
      .eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    setData(prev => (Array.isArray(prev) ? prev.filter(q => q.id !== id) : prev))
    return true
  }, [])

  const bulkDeleteQuestions = useCallback<UseGlobalCatalogResult['bulkDeleteQuestions']>(async (ids) => {
    if (!ids || ids.length === 0) return true
    const { error: err } = await supabase
      .from('catalog_questions')
      .delete()
      .in('id', ids)
    if (err) {
      setError(err.message)
      return false
    }
    const idSet = new Set(ids)
    setData(prev => (Array.isArray(prev) ? prev.filter(q => !idSet.has(q.id)) : prev))
    return true
  }, [])

  return {
    data,
    loading,
    error,
    refresh: load,
    addQuestions,
    updateQuestion,
    deleteQuestion,
    bulkDeleteQuestions,
  }
}

// Simple admin check hook: returns true if current user exists in admin list
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const { data: userData, error: meErr } = await supabase.auth.getUser()
        const me = userData?.user
        if (meErr || !me?.id) {
          setIsAdmin(false)
          setLoading(false)
          return
        }
        const userId = me.id
        const { data, error: err } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle()
        if (!active) return
        if (err) {
          setError(err.message)
          setIsAdmin(false)
        } else {
          setIsAdmin(Boolean(data))
        }
      } catch (e: any) {
        if (active) {
          setError(e.message)
          setIsAdmin(false)
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  return { isAdmin, loading, error }
}


