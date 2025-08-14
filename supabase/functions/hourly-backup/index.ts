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

    // Step 1: Update backups table with fresh data
    console.log('Updating backups table...')
    const { error: updateError } = await supabase.rpc('rotate_all_backups_hourly_for_all_users')
    if (updateError) {
      console.error('Failed to update backups:', updateError)
      throw updateError
    }

    // Step 2: Create a restorable snapshot in backup_history
    console.log('Creating restorable backup snapshot...')
    const { data: snapshotId, error: snapshotError } = await supabase.rpc('snapshot_entire_backups_table_simple')
    if (snapshotError) {
      console.error('Failed to create snapshot:', snapshotError)
      throw snapshotError
    }

    // Step 3: Cleanup old backups (older than 7 days)
    console.log('Cleaning up old backups...')
    const { data: cleanupCount, error: cleanupError } = await supabase.rpc('prune_backup_history', {
      p_days_to_keep: 7
    })
    if (cleanupError) {
      console.error('Failed to cleanup old backups:', cleanupError)
      throw cleanupError
    }

    console.log(`Hourly backup completed successfully!`)
    console.log(`- Snapshot created: ${snapshotId}`)
    console.log(`- Cleaned up: ${cleanupCount} old backups`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Hourly backup completed successfully',
        snapshot_id: snapshotId,
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
