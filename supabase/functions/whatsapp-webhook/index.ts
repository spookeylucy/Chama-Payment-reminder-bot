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

    // Parse incoming WhatsApp message
    const formData = await req.formData()
    const body = formData.get('Body')?.toString().toLowerCase().trim() || ''
    const from = formData.get('From')?.toString() || ''
    
    // Remove WhatsApp prefix
    const phoneNumber = from.replace('whatsapp:', '')
    
    // Find member by phone number
    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single()

    let responseMessage = ''

    if (memberError || !member) {
      responseMessage = "Sorry, your number is not registered in our Chama system. Please contact the admin."
    } else {
      if (['paid', 'done', 'complete', 'yes'].includes(body)) {
        if (member.has_paid) {
          responseMessage = `Hi ${member.name}! Our records show you've already paid. Thank you!`
        } else {
          // Mark as paid
          await supabaseClient
            .from('members')
            .update({ has_paid: true })
            .eq('id', member.id)
          
          // Record payment
          await supabaseClient
            .from('payments')
            .insert([{
              member_id: member.id,
              amount: 1000
            }])
          
          responseMessage = `Thank you ${member.name}! Your payment has been recorded. You're all set!`
        }
      } else if (['status', 'check'].includes(body)) {
        if (member.has_paid) {
          responseMessage = `Hi ${member.name}! You're all paid up. Thank you!`
        } else {
          responseMessage = `Hi ${member.name}! You still have a pending payment. Reply 'PAID' when you've made your contribution.`
        }
      } else {
        responseMessage = `Hi ${member.name}! Reply 'PAID' if you've made your payment, or 'STATUS' to check your payment status.`
      }
    }

    // Return TwiML response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`

    return new Response(twimlResponse, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml' 
      },
    })

  } catch (error) {
    console.error('Error:', error)
    
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, there was an error processing your message. Please try again later.</Message>
</Response>`

    return new Response(errorResponse, {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml' 
      },
    })
  }
})