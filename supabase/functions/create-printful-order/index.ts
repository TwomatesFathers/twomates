// @ts-ignore: Deno import works in Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Type declaration for Deno global
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405 
        }
      )
    }

    // Parse request body
    let orderData, confirm = true
    try {
      const body = await req.json()
      orderData = body.orderData
      confirm = body.confirm !== undefined ? body.confirm : true
    } catch (parseError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validate orderData
    if (!orderData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing orderData in request' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    // Get Printful API key from environment
    const printfulApiKey = Deno.env.get('PRINTFUL_API_KEY')
    if (!printfulApiKey) {
      console.error('Printful API key not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    console.log('Creating Printful order with data:', JSON.stringify(orderData, null, 2))

    // Create order in Printful
    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Twomates/1.0'
      },
      body: JSON.stringify({
        ...orderData,
        confirm: confirm,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Printful API error: ${response.status} - ${errorText}`)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Printful API error: ${response.status}`,
          details: errorText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        }
      )
    }

    const printfulOrder = await response.json()
    console.log('Printful order created successfully:', printfulOrder.result?.id)

    return new Response(
      JSON.stringify({ success: true, order: printfulOrder.result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      },
    )
  } catch (error) {
    console.error('Error creating Printful order:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
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