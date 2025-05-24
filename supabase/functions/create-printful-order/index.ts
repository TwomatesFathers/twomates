// @ts-ignore: Deno import works in Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Type declaration for Deno global
declare const Deno: any;

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
    const { orderData, confirm = true } = await req.json()
    
    // Get Printful API key from environment
    const printfulApiKey = Deno.env.get('PRINTFUL_API_KEY')
    if (!printfulApiKey) {
      throw new Error('Printful API key not configured')
    }

    // Create order in Printful
    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        confirm: confirm,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Printful API error: ${response.status} - ${error}`)
    }

    const printfulOrder = await response.json()

    return new Response(
      JSON.stringify({ success: true, order: printfulOrder.result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )
  } catch (error) {
    console.error('Error creating Printful order:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500,
      },
    )
  }
}) 