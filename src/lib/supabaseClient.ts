import { createClient } from '@supabase/supabase-js'

// Cloud Supabase configuration - try both VITE_ and NEXT_PUBLIC_ prefixes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  
  throw new Error(`Missing Supabase environment variables. 
  
Please create a .env.local file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use a project-specific storage key to avoid collisions with other apps
    storageKey: 'satlog-auth',
    // Disable debug mode to reduce console spam
    debug: false,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add global settings for better error handling and connection management
  global: {
    headers: {
      'x-my-custom-header': 'sat-master-log',
    },
    fetch: (url, options = {}) => {
      // Add retry logic and better error handling
      return fetch(url, {
        ...options,
        // Add connection timeout
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }).catch(error => {
        // Handle network errors more gracefully
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please check your connection');
        }
        if (error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
          throw new Error('Too many requests - please wait a moment and try again');
        }
        throw error;
      });
    }
  },
  // Reduce the number of concurrent connections
  db: {
    schema: 'public'
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      user_data: {
        Row: {
          id: string
          user_id: string
          data_type: string
          data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data_type: string
          data: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data_type?: string
          data?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      upsert_user_data: {
        Args: {
          p_user_id: string
          p_data_type: string
          p_data: any
        }
        Returns: Database['public']['Tables']['user_data']['Row']
      }
      get_user_data: {
        Args: {
          p_user_id: string
          p_data_type: string
        }
        Returns: any
      }
      delete_user_data: {
        Args: {
          p_user_id: string
          p_data_type: string
        }
        Returns: boolean
      }
      get_all_user_data: {
        Args: {
          p_user_id: string
        }
        Returns: {
          data_type: string
          data: any
          updated_at: string
        }[]
      }
    }
  }
}

// Data type constants matching localStorage keys
export const DATA_TYPES = {
  QUESTIONS: 'sat_master_log_questions',
  QUIZ_HISTORY: 'sat_master_log_quiz_history',
  IN_PROGRESS_QUIZZES: 'sat_master_log_in_progress_quizzes',
  QUESTION_ANSWERS: 'sat_master_log_question_answers',
  ALL_QUIZZES: 'sat_master_log_all_quizzes',
  CALENDAR_EVENTS: 'sat_master_log_calendar_events',
  CATALOG_QUESTIONS: 'sat_master_log_catalog_questions'
} as const

export type DataType = typeof DATA_TYPES[keyof typeof DATA_TYPES] 

// Backups table types
export interface BackupRow {
  id: string
  user_id: string
  data_type: DataType | string
  snapshot: any
  created_at: string
  updated_at: string
}