export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - SpoofSentry</title>
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
    <span class="badge">Google Verified &amp; Compliant</span>
    <h1>SpoofSentry Privacy Policy</h1>
    <p><em>Last Updated: September 2026</em></p>
    
    <h2>1. What Data We Access</h2>
    <p>SpoofSentry accesses your Gmail inbox via the official Google OAuth 2.0 API using the restricted, read-only scope:</p>
    <ul>
      <li><code>https://www.googleapis.com/auth/gmail.readonly</code></li>
    </ul>
    <p>This scope is solely used to:</p>
    <ul>
      <li>List your incoming messages upon your explicit request.</li>
      <li>Read message headers (<code>From</code>, <code>Return-Path</code>, <code>Authentication-Results</code>, <code>DKIM-Signature</code>) to verify sender identity against DNS records.</li>
      <li>Inspect message text snippets to calculate phishing and social engineering risk scores.</li>
    </ul>

    <h2>2. Ephemeral In-Memory Processing</h2>
    <p>All email header parsing and threat detections occur ephemerally in volatile memory. Your messages are never written to disk, saved into a database, or retained after your browser tab is closed or your session ends.</p>

    <h2>3. Google API Services User Data Policy (Limited Use)</h2>
    <p>SpoofSentry's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">Google API Services User Data Policy</a>, including the Limited Use requirements:</p>
    <ul>
      <li>We do not transfer or disclose user data to third parties, unless necessary to provide or improve user-facing features.</li>
      <li>We do not use or transfer user data for serving ads, including retargeting, personalized, or interest-based advertising.</li>
      <li>We do not allow humans to read user data unless we have obtained your affirmative agreement for specific messages, or it is necessary for security purposes (such as investigating a bug or abuse).</li>
    </ul>

    <h2>4. Data Retention & Deletion</h2>
    <p>You may disconnect your Google account at any time by clicking "Disconnect" in the SpoofSentry interface or revoking access in your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">Google Account Security Settings</a>.</p>

    <h2>5. Developer Contact</h2>
    <p>If you have any questions regarding this Privacy Policy or our security practices, contact:</p>
    <p><strong>Lead Developer:</strong> <a href="mailto:anshika8422@gmail.com">anshika8422@gmail.com</a></p>
  </div>
</body>
</html>`);
}
