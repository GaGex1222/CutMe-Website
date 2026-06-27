import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Brevo sends the inbound email as JSON to this endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: BrevoInboundItem[] = body.items ?? [];

    for (const item of items) {
      const toAddresses: string[] = (item.To ?? []).map((t: { Address: string }) => t.Address);

      // Find the dis- token in any of the To addresses
      let token: string | null = null;
      for (const addr of toAddresses) {
        const match = addr.match(/^dis-([a-z0-9]+)@/i);
        if (match) { token = match[1].toLowerCase(); break; }
      }

      if (!token) continue;

      // Update the disconnection request in Supabase
      const { error } = await supabaseAdmin
        .from('disconnection_requests')
        .update({
          status: 'replied',
          reply_from: item.From?.Address ?? null,
          reply_subject: item.Subject ?? null,
          reply_content: item.ExtractedMarkdownMessage ?? item.RawTextBody ?? null,
          replied_at: new Date().toISOString(),
        })
        .eq('token', token);

      if (error) {
        console.error(`Failed to update token ${token}:`, error.message);
      } else {
        console.log(`✅ Reply received for token ${token}`);
      }
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
