const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const INBOUND_DOMAIN = process.env.INBOUND_DOMAIN ?? 'inbound.galdadon.com';
const SENDER_EMAIL = process.env.SENDER_EMAIL ?? 'noreply@galdadon.com';
const SENDER_NAME = process.env.SENDER_NAME ?? 'CutMe';

interface SendDisconnectionEmailParams {
  toEmail: string;
  company: string;
  firstName: string;
  lastName: string;
  token: string;
  pdfBase64: string;
}

export async function sendDisconnectionEmail({
  toEmail,
  company,
  firstName,
  lastName,
  token,
  pdfBase64,
}: SendDisconnectionEmailParams): Promise<void> {
  const replyTo = `dis-${token}@${INBOUND_DOMAIN}`;

  const body = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail }],
    replyTo: { email: replyTo },
    subject: `בקשת ניתוק — ${firstName} ${lastName}`,
    htmlContent: `
      <div dir="rtl" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8;">
        <p>לכבוד מחלקת הניתוקים של <strong>${company}</strong>,</p>
        <p>
          מצ"ב בקשת ניתוק רשמית של <strong>${firstName} ${lastName}</strong>
          בהתאם לחוק הגנת הצרכן.
        </p>
        <p>
          על פי החוק, הנכם מחויבים לנתק את המנוי תוך 3 ימי עסקים מקבלת מסמך זה.
        </p>
        <p style="color:#6b7280; font-size:12px;">
          מספר בקשה: ${token}<br/>
          לכל תגובה יש להשיב למייל זה בלבד.
        </p>
      </div>
    `,
    attachment: [
      {
        content: pdfBase64,
        name: `disconnection-${token}.pdf`,
      },
    ],
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo send failed: ${err}`);
  }
}
