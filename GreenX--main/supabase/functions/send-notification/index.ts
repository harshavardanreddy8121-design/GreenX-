import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { type, subject, data } = await req.json();

    const TO_EMAIL = 'harshavardanreddy7730@gmail.com';

    // Build HTML email based on notification type
    let htmlBody = buildEmailHtml(type, subject, data);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GreenX <onboarding@resend.dev>',
        to: [TO_EMAIL],
        subject: `[GreenX] ${subject}`,
        html: htmlBody,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', result);
      throw new Error(`Email send failed [${res.status}]: ${JSON.stringify(result)}`);
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildEmailHtml(type: string, subject: string, data: Record<string, any>): string {
  const header = `
    <div style="background: #0d3320; padding: 20px; text-align: center;">
      <h1 style="color: #4ade80; margin: 0; font-size: 28px;">Green<span style="color: white;">X</span></h1>
      <p style="color: #86efac; margin: 4px 0 0; font-size: 12px;">Agricultural Intelligence Platform</p>
    </div>
  `;

  const footer = `
    <div style="background: #f0fdf4; padding: 16px; text-align: center; font-size: 12px; color: #666;">
      <p>This is an automated notification from GreenX Platform</p>
      <p>© ${new Date().getFullYear()} GreenX AgriTech</p>
    </div>
  `;

  let body = '';

  switch (type) {
    case 'task_assigned':
      body = `
        <h2 style="color: #0d3320;">New Task Assigned</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Task</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.task}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Assigned To</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.assignedTo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Farmer</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.farmer}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.date}</td></tr>
        </table>
      `;
      break;

    case 'task_completed':
      body = `
        <h2 style="color: #0d3320;">Task Completed ✅</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Task</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.task}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Completed By</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.completedBy}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.date}</td></tr>
          ${data.hasPhoto ? '<tr><td style="padding: 8px; font-weight: bold;">Photo Proof</td><td style="padding: 8px;">📷 Photo uploaded</td></tr>' : ''}
        </table>
      `;
      break;

    case 'photo_uploaded':
      body = `
        <h2 style="color: #0d3320;">📷 Photo Proof Uploaded</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Uploaded By</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.uploadedBy}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Context</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.context}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Farmer</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.farmer}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Date</td><td style="padding: 8px;">${data.date}</td></tr>
        </table>
      `;
      break;

    case 'support_request':
      body = `
        <h2 style="color: #0d3320;">🆘 Support Request</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">From</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.from}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Role</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.role}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Subject</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.subject}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Message</td><td style="padding: 8px;">${data.message}</td></tr>
        </table>
      `;
      break;

    case 'prescription':
      body = `
        <h2 style="color: #0d3320;">💊 Expert Prescription Generated</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Expert</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.expert}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Farmer</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.farmer}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Crop</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.crop}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Prescription</td><td style="padding: 8px;">${data.prescription}</td></tr>
        </table>
      `;
      break;

    case 'attendance':
      body = `
        <h2 style="color: #0d3320;">✅ Attendance Marked</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Worker</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.worker}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Village</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.village}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Time</td><td style="padding: 8px;">${data.time}</td></tr>
        </table>
      `;
      break;

    case 'worker_assigned':
      body = `
        <h2 style="color: #0d3320;">👷 Worker Assigned</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Worker</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.worker}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Farmer</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.farmer}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Village</td><td style="padding: 8px;">${data.village}</td></tr>
        </table>
      `;
      break;

    case 'report_generated':
      body = `
        <h2 style="color: #0d3320;">📊 Report Generated</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Generated By</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.generatedBy}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Report Type</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.reportType}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Details</td><td style="padding: 8px;">${data.details}</td></tr>
        </table>
      `;
      break;

    default:
      body = `
        <h2 style="color: #0d3320;">${subject}</h2>
        <pre style="background: #f9fafb; padding: 16px; border-radius: 8px; font-size: 13px;">${JSON.stringify(data, null, 2)}</pre>
      `;
  }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${header}
      <div style="padding: 24px;">
        ${body}
      </div>
      ${footer}
    </div>
  `;
}
