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

    // Step 1: Create a snapshot of the current backups table
    console.log('Creating restorable backup snapshot...')
    const { error: snapshotError } = await supabase.rpc('snapshot_entire_backups_table_simple')
    if (snapshotError) {
      console.error('Failed to create snapshot:', snapshotError)
      throw snapshotError
    }

    // Step 2: Update the backups table updated_at to reset the timer
    console.log('Updating backups table timestamp...')
    const { error: updateError } = await supabase
      .from('backups')
      .update({ updated_at: new Date().toISOString() })
    if (updateError) {
      console.error('Failed to update backups timestamp:', updateError)
      // Don't throw, this is not critical
      console.log('Continuing despite timestamp update failure...')
    }

    // Step 3: Cleanup old backups (like the "Cleanup Old Backups" button)
    console.log('Cleaning up old backups...')
    const { data: cleanupCount, error: cleanupError } = await supabase.rpc('prune_backup_history', {
      p_keep_hourly: 168, // Keep 7 days worth of hourly backups (7 * 24 = 168)
      p_keep_daily_days: 7 // Keep daily backups for 7 days
    })
    if (cleanupError) {
      console.error('Failed to cleanup old backups:', cleanupError)
      throw cleanupError
    }



    console.log(`Hourly backup completed successfully!`)
    console.log(`- Cleaned up: ${cleanupCount} old backups`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Hourly backup completed successfully',
        cleanup_count: cleanupCount
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
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
