import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get unpaid members
    const { data: unpaidMembers, error } = await supabaseClient
      .from('members')
      .select('*')
      .eq('has_paid', false)

    if (error) {
      throw error
    }

    // Here you would integrate with Twilio to send WhatsApp messages
    // For now, we'll just return the count of members who would receive reminders
    
    const reminderCount = unpaidMembers?.length || 0
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Would send reminders to ${reminderCount} unpaid members`,
        count: reminderCount,
        members: unpaidMembers?.map(m => ({ name: m.name, phone: m.phone_number }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})