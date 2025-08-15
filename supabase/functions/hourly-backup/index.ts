import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting hourly backup process...')

    // Step 1: Create a REAL restorable snapshot of the backups table
    console.log('Creating restorable backup snapshot via RPC...')
    const { error: snapshotError } = await supabase.rpc('snapshot_entire_backups_table_simple')
    if (snapshotError) {
      console.error('Failed to create snapshot:', snapshotError)
      throw snapshotError
    }

    // Step 2: Bump backups.updated_at to reset timers
    console.log('Bumping backups timestamps via RPC...')
    const { error: bumpError } = await supabase.rpc('bump_backups_timestamp')
    if (bumpError) {
      console.error('Failed to bump backups timestamps:', bumpError)
      // Non-fatal
    }

    // Step 3: Cleanup old backups (7 days retention)
    console.log('Cleaning up old backups via RPC...')
    const { data: cleanupCount, error: cleanupError } = await supabase.rpc('prune_backup_history', {
      p_keep_hourly: 168, // 7 days * 24 hours
      p_keep_daily_days: 7
    })
    if (cleanupError) {
      console.error('Failed to cleanup old backups:', cleanupError)
      // Non-fatal
    }

    console.log(`Hourly backup completed successfully!`)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Hourly backup completed successfully',
        cleanup_count: cleanupCount ?? 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Hourly backup failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as any)?.message ?? 'unknown'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
