import { validateEmailInput } from '../src/utils/emailValidator';
import { evaluateEmail } from '../src/utils/forensicsEngine';

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // use raw
      }
    }

    let { from, return_path, dkim_header, subject, body: emailBody, date, source, headersUnavailable } = body || {};

    // Strict Validation: Reject if this is not an email
    const validation = validateEmailInput({
      from,
      subject,
      body: emailBody,
      text: [from, subject, emailBody].filter(Boolean).join('\n')
    });

    if (!validation.isEmail) {
      return res.status(400).json({
        error: `This is not an email. ${validation.reason}`,
        is_not_email: true,
        detected_type: validation.detectedType,
        reason: validation.reason,
        details: validation.details
      });
    }

    // Sender email check: must contain a valid email address
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (!from || !from.trim() || !emailRegex.test(from)) {
      const emailInBody = emailBody ? emailBody.match(emailRegex) : null;
      if (emailInBody) {
        from = emailInBody[0];
        if (!headersUnavailable) {
          headersUnavailable = true;
        }
      } else {
        return res.status(400).json({
          error: 'This is not an email. A valid sender email address (e.g. name@domain.com) or RFC From header is required.',
          is_not_email: true,
          detected_type: 'missing_sender'
        });
      }
    }

    const result = await evaluateEmail({
      fromAddress: from,
      returnPath: return_path,
      dkimHeader: dkim_header,
      subject,
      body: emailBody,
      dateStr: date
    });

    const enrichedResult = {
      ...result,
      source: source || 'manual',
      headersUnavailable: Boolean(headersUnavailable)
    };

    res.status(200).json(enrichedResult);
  } catch (error: any) {
    console.error('Vercel API Analyze error:', error);
    res.status(500).json({ error: error.message || 'Internal error during email analysis.' });
  }
}
