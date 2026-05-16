import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

interface MinisterEmailData {
  referrerName: string;
  personName: string;
  situation: string;
  prayerRequests: string;
  notes?: string;
}

interface ReferrerEmailData {
  personName: string;
  code: string;
  bookingUrl: string;
}

interface AdminEmailData {
  referrerName: string;
  personName: string;
  adminUrl: string;
}

export async function sendMinisterEmail(data: MinisterEmailData) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2D2A26;">
      <p style="font-size: 18px; line-height: 1.6;">
        A new request has come in. Please take a moment to pray for them before they book a time.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

      <p style="font-size: 16px; margin-bottom: 8px;">
        <strong>Referred by:</strong> ${escapeHtml(data.referrerName)}
      </p>
      <p style="font-size: 16px; margin-bottom: 16px;">
        <strong>For:</strong> ${escapeHtml(data.personName)}
      </p>

      <p style="font-size: 16px; margin-bottom: 8px;"><strong>What they're walking through:</strong></p>
      <p style="background: #F5F0EB; padding: 16px; border-radius: 8px; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
${escapeHtml(data.situation)}
      </p>

      <p style="font-size: 16px; margin-bottom: 8px; margin-top: 24px;"><strong>Prayer requests:</strong></p>
      <p style="background: #F5F0EB; padding: 16px; border-radius: 8px; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
${escapeHtml(data.prayerRequests)}
      </p>

      ${data.notes ? `
        <p style="font-size: 16px; margin-bottom: 8px; margin-top: 24px;"><strong>Notes:</strong></p>
        <p style="background: #F5F0EB; padding: 16px; border-radius: 8px; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
${escapeHtml(data.notes)}
        </p>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

      <p style="color: #6B6560; font-size: 14px;">
        They'll book a time soon. We'll send you the calendar invite when they do.
      </p>
    </div>
  `;

  return getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.MINISTERS_EMAIL!,
    subject: `Someone to pray for — ${data.personName}`,
    html,
  });
}

export async function sendReferrerEmail(data: ReferrerEmailData) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2D2A26;">
      <p style="font-size: 18px; line-height: 1.6;">
        Thank you for caring for ${escapeHtml(data.personName)}. Mama and Papa have received your request and are already praying.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

      <p style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">
        Please pass this along to them personally:
      </p>

      <div style="background: #F5F0EB; padding: 24px; border-radius: 12px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B6560;">Booking link:</p>
        <p style="margin: 0 0 20px 0;">
          <a href="${data.bookingUrl}" style="color: #8B9E8B; font-size: 16px;">${data.bookingUrl}</a>
        </p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B6560;">Access code:</p>
        <p style="font-size: 28px; font-weight: 600; font-family: 'SF Mono', 'Courier New', monospace; margin: 0; letter-spacing: 0.1em;">
          ${data.code}
        </p>
      </div>

      <p style="color: #6B6560; font-size: 14px; line-height: 1.6;">
        This code is good for 60 days and they can book as many sessions as they need in that window.
        If they'd like to come back after that, just submit another request and we'll send a new code.
      </p>
    </div>
  `;

  return getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: data.personName, // This should actually be referrer email - will be passed separately
    subject: `Here's the link for ${data.personName}`,
    html,
  });
}

export async function sendReferrerEmailTo(email: string, data: ReferrerEmailData) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2D2A26;">
      <p style="font-size: 18px; line-height: 1.6;">
        Thank you for caring for ${escapeHtml(data.personName)}. Mama and Papa have received your request and are already praying.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

      <p style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">
        Please pass this along to them personally:
      </p>

      <div style="background: #F5F0EB; padding: 24px; border-radius: 12px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B6560;">Booking link:</p>
        <p style="margin: 0 0 20px 0;">
          <a href="${data.bookingUrl}" style="color: #8B9E8B; font-size: 16px;">${data.bookingUrl}</a>
        </p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B6560;">Access code:</p>
        <p style="font-size: 28px; font-weight: 600; font-family: 'SF Mono', 'Courier New', monospace; margin: 0; letter-spacing: 0.1em;">
          ${data.code}
        </p>
      </div>

      <p style="color: #6B6560; font-size: 14px; line-height: 1.6;">
        This code is good for 60 days and they can book as many sessions as they need in that window.
        If they'd like to come back after that, just submit another request and we'll send a new code.
      </p>
    </div>
  `;

  return getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `Here's the link for ${data.personName}`,
    html,
  });
}

export async function sendAdminEmail(data: AdminEmailData) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2A26;">
      <p style="font-size: 16px;">
        New request submitted.
      </p>
      <p style="font-size: 16px;">
        <strong>Referred by:</strong> ${escapeHtml(data.referrerName)}<br>
        <strong>For:</strong> ${escapeHtml(data.personName)}
      </p>
      <p style="margin-top: 24px;">
        <a href="${data.adminUrl}" style="color: #8B9E8B;">View in admin →</a>
      </p>
    </div>
  `;

  return getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.ADMIN_EMAIL!,
    subject: `New request: ${data.personName}`,
    html,
  });
}

// Helper to escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
