import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { supabaseAdmin } from '@/lib/supabase';
import { sendDisconnectionEmail } from '@/lib/brevo';
import { COMPANY_EMAILS } from '@/lib/companyEmails';

const FONT_LINK = `
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700&display=swap"/>
`;

const BASE_STYLE = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Heebo', Arial, sans-serif;
      font-size: 13pt;
      line-height: 1.9;
      color: #000;
      background: #fff;
      direction: rtl;
    }
    .page { padding: 72px 80px; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
  </style>
`;

function cancellationPage(company: string, form: Record<string, string>, requestId: string): string {
  const today = new Date().toLocaleDateString('he-IL');
  const fullPhone = `${form.phonePrefix}-${form.phone}`;
  const disPhone  = `${form.disPrefix}-${form.disPhone}`;
  const address   = [form.street, form.houseNum, form.city].filter(Boolean).join(', ');

  return `
  <div class="page">
    <div style="text-align:left;font-size:11pt;margin-bottom:36px;">
      ${requestId}<br/>תאריך: ${today}
    </div>

    <div style="text-align:right;margin-bottom:24px;">
      <p><strong>לכבוד:</strong></p>
      <p>חברת ${company}</p>
      <p>מחלקת ניתוקים</p>
    </div>

    <div style="font-size:14pt;font-weight:bold;text-align:right;margin-bottom:28px;text-decoration:underline;">
      הנדון: בקשת ניתוק משירות ${form.serviceType}.
    </div>

    <div style="text-align:right;margin-bottom:14px;">
      בהתאם לסעיף 13ד לחוק הגנת הצרכן, התשמ"א-1981, הריני מודיע על ביטול העסקה המתמשכת לאספקת שירות ${form.serviceType}.
    </div>

    <div style="text-align:right;margin-bottom:14px;">
      שמי הוא <u>${form.firstName} ${form.lastName}</u>, מספר תעודת הזהות שלי הינו <u>${form.idNumber}</u>
      ומספר הטלפון שלי הוא <u>${disPhone}</u>.
    </div>

    <div style="text-align:right;margin-bottom:14px;">
      כתובתי היא <u>${address}</u> וארבע הספרות האחרונות של אמצעי התשלום לתשלום הינם <u>${form.last4}</u>.
    </div>

    <div style="text-align:right;margin-bottom:14px;">
      בהתאם לסעיף 13ג(ג) לחוק, הנכם נדרשים לנתק אותי מיידית, ולא מאוחר משלושה ימים מיום משלוח הודעה זו.
    </div>

    <div style="text-align:right;margin-bottom:14px;">
      באם לא תעשו כן, על פי סעיף 13ד(ד) לחוק, בית המשפט יהיה רשאי להטיל עליכם פיצויים עונשיים.
    </div>

    <div style="text-align:right;margin-bottom:14px;">
      הודעתי היא סופית, ואני מבקש/ת כי לא יפנו אלי נציגי שירות לקוחות וכיוצא בזה.
    </div>

    <div style="margin-top:48px;text-align:right;">
      <p>בברכה,</p>
      <p>${form.firstName} ${form.lastName}</p>
      <p style="font-size:11pt;color:#555;margin-top:4px;">${form.email} · ${fullPhone}</p>
    </div>

    <div style="text-align:left;font-size:11pt;margin-top:80px;color:#333;">${requestId}</div>
  </div>`;
}

function poaPage(form: Record<string, string>, signature: string | null): string {
  const today = new Date().toLocaleDateString('he-IL');
  const fullPhone = `${form.phonePrefix}-${form.phone}`;

  return `
  <div class="page">
    <div style="text-align:center;margin-bottom:32px;border-bottom:2px solid #000;padding-bottom:12px;">
      <h1 style="font-size:16pt;font-weight:700;letter-spacing:1px;">ייפוי כוח</h1>
    </div>

    <div style="margin-bottom:24px;border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#f8fafc;">
      <p style="margin-bottom:6px;">• <strong>שם מלא:</strong> ${form.firstName} ${form.lastName}</p>
      <p style="margin-bottom:6px;">• <strong>תעודת זהות:</strong> ${form.idNumber}</p>
      <p style="margin-bottom:6px;">• <strong>טלפון:</strong> ${fullPhone}</p>
      <p>• <strong>דוא"ל:</strong> ${form.email}</p>
    </div>

    <div style="margin-bottom:20px;font-size:12pt;line-height:1.8;">
      ממנה ומייפה את כוחה של <strong>CutMe</strong> (להלן: "השליח"), ו/או מי מטעמם, להיות שלוחי ונציגי החוקיים לבצע בשמי ובמקומי את הפעולות הבאות:
    </div>

    <ol style="padding-right:20px;margin-bottom:32px;font-size:12pt;line-height:1.9;">
      <li style="margin-bottom:12px;">
        <strong>משלוח הודעת ביטול:</strong> לשלוח הודעות ביטול לכל חברה, בית עסק או ספק שירותים (להלן: "הספק"), בהתאם לפרטים הספציפיים שאגיש במערכת.
      </li>
      <li style="margin-bottom:12px;">
        <strong>בירור ואימות:</strong> לפנות אל הספקים לצורך בירור סטטוס ביטול העסקה, אימות קבלת הודעת הניתוק, ודרישת הפסקת חיובים, בהתאם להוראות חוק הגנת הצרכן, התשמ"א-1981.
      </li>
      <li style="margin-bottom:12px;">
        <strong>חתימה על מסמכים:</strong> לחתום בשמי על כל הודעה, טופס או מסמך הנדרשים על ידי הספקים לצורך השלמת תהליך הניתוק או הביטול.
      </li>
    </ol>

    <div style="border-top:1px solid #cbd5e1;padding-top:24px;margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;">
      <div style="font-size:11pt;color:#555;">
        <p>תאריך: ${today}</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:11pt;color:#555;margin-bottom:6px;">חתימת הלקוח (דיגיטלית):</p>
        ${signature
          ? `<img src="${signature}" style="height:70px;display:block;border-bottom:1px solid #94a3b8;" />`
          : `<div style="width:220px;border-bottom:1px solid #000;height:60px;"></div>`
        }
        <p style="font-size:10pt;color:#888;margin-top:4px;">${form.firstName} ${form.lastName}</p>
      </div>
    </div>
  </div>`;
}

function buildHtml(company: string, form: Record<string, string>, requestId: string, signature: string | null): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8"/>
  ${FONT_LINK}
  ${BASE_STYLE}
</head>
<body>
  ${cancellationPage(company, form, requestId)}
  ${poaPage(form, signature)}
</body>
</html>`;
}

function generateToken(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  try {
    const { company, form, signature } = await req.json();

    // 1. Generate PDF
    const token = generateToken();
    const requestId = `CUT-${token.toUpperCase()}`;
    const html = buildHtml(company, form, requestId, signature ?? null);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    await browser.close();

    // 2. Upload PDF to Supabase Storage
    const filename = `${requestId}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('disconnection-pdfs')
      .upload(filename, pdfBuffer, { contentType: 'application/pdf', upsert: false });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('disconnection-pdfs')
      .getPublicUrl(filename);

    // 3. Save request to DB
    const { error: dbError } = await supabaseAdmin
      .from('disconnection_requests')
      .insert({
        token,
        request_id: requestId,
        company,
        service_type: form.serviceType,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: `${form.phonePrefix}-${form.phone}`,
        pdf_url: publicUrl,
        status: 'sent',
      });

    if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

    // 4. Send email via Brevo
    const companyEmail = COMPANY_EMAILS[company];
    if (companyEmail) {
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
      await sendDisconnectionEmail({
        toEmail: companyEmail,
        company,
        firstName: form.firstName,
        lastName: form.lastName,
        token,
        pdfBase64,
      });
    }

    return NextResponse.json({ success: true, requestId, token });
  } catch (err) {
    console.error('create-form error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
