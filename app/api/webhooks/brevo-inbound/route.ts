import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const SENDER_EMAIL = process.env.SENDER_EMAIL ?? 'noreply@galdadon.com';
const SENDER_NAME = process.env.SENDER_NAME ?? 'CutMe';

async function notifyCustomer({
  customerEmail,
  customerName,
  company,
  replyFrom,
  replySubject,
  replyContent,
  requestId,
}: {
  customerEmail: string;
  customerName: string;
  company: string;
  replyFrom: string;
  replySubject: string;
  replyContent: string;
  requestId: string;
}) {
  const body = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: customerEmail, name: customerName }],
    subject: `עדכון על בקשת הניתוק שלך מ${company}`,
    htmlContent: `
      <div dir="rtl" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; max-width: 600px;">
        <div style="background: #f0fdf4; border-right: 4px solid #22c55e; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #15803d;">
            📩 חברת ${company} השיבה לבקשת הניתוק שלך!
          </p>
        </div>

        <p>שלום ${customerName},</p>
        <p>קיבלנו תגובה מ<strong>${company}</strong> לבקשת הניתוק שלך (מספר בקשה: <strong>${requestId}</strong>).</p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">
            נושא: ${replySubject}
          </p>
          <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
            מאת: ${replyFrom}
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;" />
          <div style="white-space: pre-wrap; color: #334155;">${replyContent}</div>
        </div>

        <p style="color: #64748b; font-size: 12px;">
          אם יש לך שאלות, ניתן לפנות אלינו בכל עת.<br/>
          צוות CutMe
        </p>
      </div>
    `,
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo notify failed: ${err}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: BrevoInboundItem[] = body.items ?? [];

    for (const item of items) {
      const toAddresses: string[] = (item.To ?? []).map((t: { Address: string }) => t.Address);

      // Extract token from dis-{token}@inbound.galdadon.com
      let token: string | null = null;
      for (const addr of toAddresses) {
        const match = addr.match(/^dis-([a-z0-9]+)@/i);
        if (match) { token = match[1].toLowerCase(); break; }
      }

      if (!token) continue;

      // Fetch the original request to get customer email
      const { data: request, error: fetchError } = await supabaseAdmin
        .from('disconnection_requests')
        .select('email, first_name, last_name, company, request_id')
        .eq('token', token)
        .single();

      if (fetchError || !request) {
        console.error(`Token ${token} not found:`, fetchError?.message);
        continue;
      }

      // Update status in DB
      const { error: updateError } = await supabaseAdmin
        .from('disconnection_requests')
        .update({
          status: 'replied',
          reply_from: item.From?.Address ?? null,
          reply_subject: item.Subject ?? null,
          reply_content: item.ExtractedMarkdownMessage ?? item.RawTextBody ?? null,
          replied_at: new Date().toISOString(),
        })
        .eq('token', token);

      if (updateError) {
        console.error(`Failed to update token ${token}:`, updateError.message);
        continue;
      }

      // Forward the reply to the customer
      await notifyCustomer({
        customerEmail: request.email,
        customerName: `${request.first_name} ${request.last_name}`,
        company: request.company,
        replyFrom: item.From?.Address ?? 'לא ידוע',
        replySubject: item.Subject ?? 'ללא נושא',
        replyContent: item.ExtractedMarkdownMessage ?? item.RawTextBody ?? 'לא נמצא תוכן',
        requestId: request.request_id,
      });

      console.log(`✅ Reply forwarded to customer for token ${token}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('brevo-inbound webhook error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

interface BrevoInboundItem {
  From?: { Address: string; Name?: string };
  To?: { Address: string; Name?: string }[];
  Subject?: string;
  ExtractedMarkdownMessage?: string;
  RawTextBody?: string;
}
