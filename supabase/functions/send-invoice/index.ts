import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to_email, client_name, invoice_number, company_name, total, pdf_base64, message_url } = await req.json()

    if (!to_email) {
      return new Response(
        JSON.stringify({ error: 'El cliente no tiene email configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY no configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailBody = {
      from: `${company_name || 'Facturación'} <facturas@javierfullstack.es>`,
      to: [to_email],
      subject: `Factura ${invoice_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #e0e7ff, #ede9fe); padding: 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #4338ca; margin: 0; font-size: 24px;">${company_name || 'Tu empresa'}</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #334155; font-size: 16px;">Hola <strong>${client_name}</strong>,</p>
            <p style="color: #64748b;">Adjuntamos la factura <strong>${invoice_number}</strong> por un importe total de <strong>${Number(total).toFixed(2)} €</strong>.</p>
            <p style="color: #64748b;">Por favor, revisa el documento adjunto. Si tienes alguna duda, no dudes en contactarnos.</p>
            ${message_url ? `
            <div style="text-align: center; margin: 24px 0;">
              <a href="${message_url}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">
                Enviar una consulta
              </a>
            </div>` : ''}
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 13px;">Este email ha sido generado automáticamente.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `factura-${invoice_number}.pdf`,
          content: pdf_base64,
        },
      ],
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({ error: resendData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
