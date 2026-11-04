import { GoogleGenAI, Type } from '@google/genai';
import { validateEmailInput } from '../src/utils/emailValidator';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
        // noop
      }
    }

    let base64Data = '';
    let mimeType = 'image/png';

    if (body?.imageBase64) {
      base64Data = body.imageBase64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
      mimeType = body.mimeType || 'image/png';
    }

    if (!base64Data) {
      return res.status(400).json({ error: 'No screenshot image received for OCR extraction.', fallbackAvailable: true });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini AI Vision service is not configured (GEMINI_API_KEY missing). Local fallback available.',
        fallbackAvailable: true
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `You are a strict forensic email cybersecurity analyst. Inspect this screenshot carefully.
CRITICAL EMAIL VALIDATION:
1. Determine whether this screenshot shows an actual email message or email client (such as Gmail, Outlook, Apple Mail, Yahoo Mail, mobile mail app, webmail, or an email message with headers/body).
2. If the screenshot contains programming source code (IDE, text editor like VSCode, programming script in Python, JavaScript/TypeScript, Java, C++, HTML/CSS, terminal logs, command prompt, document, or non-email application):
   - Set is_email to false.
   - Set detected_type to "source_code" (or "terminal", "document", "other").
   - Set rejection_reason to "The uploaded screenshot appears to be programming source code or a non-email window. SpoofSentry only performs forensics on email messages."
   - DO NOT invent, hallucinate, or extract line numbers, variables, or functions as sender name, sender number, or dates! Leave from, subject, and date as empty strings ("").
   - Set full_text to the legible text in the screenshot.
3. ONLY IF the screenshot genuinely displays an email message or email client:
   - Set is_email to true.
   - Set detected_type to "email".
   - Set rejection_reason to "".
   - Extract:
     1. Sender address and display name (e.g. '"Security Team" <alerts@security-portal.xyz>' or clean email)
     2. Subject line
     3. Date / timestamp if visible
     4. Full legible email message body (all sentences, paragraphs, instructions, wire details)
     5. Any visible URLs, domains, login portals, or raw IP addresses
     6. Detected email client or platform (e.g. "Gmail Web", "Gmail Mobile", "Outlook", "Apple Mail")
     7. Summary of what the sender is asking or coercing the user to do.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_email: { type: Type.BOOLEAN, description: 'True if the image is an email or email client; false if source code, terminal, document, or non-email' },
            detected_type: { type: Type.STRING, description: 'Category: email, source_code, terminal, document, or other' },
            rejection_reason: { type: Type.STRING, description: 'Clear explanation if is_email is false' },
            from: { type: Type.STRING, description: 'The sender address or "Display Name <email>" if email, otherwise empty string' },
            subject: { type: Type.STRING, description: 'The subject line if email, otherwise empty string' },
            date: { type: Type.STRING, description: 'The date and time shown in the email' },
            body: { type: Type.STRING, description: 'The full legible email body text if email, or extracted code text' },
            links: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'All URLs, links, or IP addresses found'
            },
            full_text: { type: Type.STRING, description: 'All legible text visible in the screenshot' },
            detected_platform: { type: Type.STRING, description: 'The client application detected' },
            summary: { type: Type.STRING, description: 'One-sentence summary of the message' }
          },
          required: ['is_email', 'detected_type', 'full_text']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini model returned empty response.');
    }

    const parsed = JSON.parse(responseText);

    const heuristicCheck = validateEmailInput({
      text: parsed.full_text || parsed.body || '',
      from: parsed.from,
      subject: parsed.subject,
      body: parsed.body
    });

    const isEmail = Boolean(parsed.is_email && heuristicCheck.isEmail);
    const detectedType = !isEmail ? (parsed.detected_type && parsed.detected_type !== 'email' ? parsed.detected_type : heuristicCheck.detectedType) : 'email';
    const rejectionReason = !isEmail
      ? (parsed.rejection_reason || heuristicCheck.reason || 'The uploaded screenshot is programming source code or not an email message. SpoofSentry only analyzes email messages.')
      : '';

    if (!isEmail) {
      parsed.from = '';
      parsed.subject = '';
      parsed.date = '';
    }

    res.status(200).json({
      success: true,
      engine: 'gemini-3.8-flash',
      is_email: isEmail,
      detected_type: detectedType,
      rejection_reason: rejectionReason,
      data: {
        ...parsed,
        is_email: isEmail,
        detected_type: detectedType,
        rejection_reason: rejectionReason
      }
    });
  } catch (error: any) {
    console.error('Screenshot OCR error:', error);
    res.status(500).json({
      error: error.message || 'Failed to extract text from screenshot using AI.',
      fallbackAvailable: true
    });
  }
}
