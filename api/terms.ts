export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - SpoofSentry</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #fafaf9; }
    .card { background: white; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
    h1 { color: #047857; margin-top: 0; font-size: 28px; }
    h2 { color: #0f172a; margin-top: 28px; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    p, li { font-size: 14px; color: #334155; }
    .badge { display: inline-block; background: #e8fbf3; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
    a { color: #059669; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Legal Terms</span>
    <h1>SpoofSentry Terms of Service</h1>
    <p><em>Last Updated: September 2026</em></p>
    
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing or using SpoofSentry, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the application.</p>

    <h2>2. Purpose of the Application</h2>
    <p>SpoofSentry provides defensive cybersecurity analysis, email authentication verification (SPF, DKIM, DMARC), and social engineering detection to help users identify potential email spoofing and phishing attempts.</p>

    <h2>3. Acceptable Use</h2>
    <p>You agree to use SpoofSentry only for lawful cybersecurity analysis and verification of emails you are authorized to inspect. You may not attempt to reverse engineer, disrupt, or exploit the service.</p>

    <h2>4. Limitation of Liability &amp; Disclaimer</h2>
    <p>SpoofSentry is provided on an "as is" and "as available" basis. While we strive for high accuracy through cryptographic DNS checks and heuristic scoring, no automated tool can guarantee 100% detection of all phishing attacks. Users should exercise caution with any suspicious communications.</p>

    <h2>5. Contact Information</h2>
    <p>For questions or support regarding these terms, please contact: <a href="mailto:anshika8422@gmail.com">anshika8422@gmail.com</a>.</p>
  </div>
</body>
</html>`);
}
