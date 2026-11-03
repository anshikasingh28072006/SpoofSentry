# SpoofSentry — Email Spoofing & Threat Detection Engine

**SpoofSentry** is an explainable, rule-based cybersecurity web application designed to evaluate email authenticity and detect spoofing attacks. Built for security analysts and cybersecurity students, SpoofSentry combines live DNS authentication verification (SPF, DKIM, DMARC), sender domain alignment inspection, heuristic social-engineering content scanning, and send-time anomaly detection into an actionable threat verdict.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Python 3.9+ installed
- Active internet connection (for live DNS TXT lookups against public nameservers)

### 1. Clone & Install Dependencies
```bash
# Optional: create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required Python packages
pip install -r requirements.txt
```

### 2. Run Verification Test Suite
Verify live DNS resolution and rule logic against real-world test cases:
```bash
python3 test_detector.py
```

### 3. Launch Flask Web Application
```bash
python3 app.py
```
Open your browser and navigate to `http://localhost:3000` (or the port displayed in your terminal).

---

## 📧 Gmail Live Intake Integration (Google Cloud OAuth Setup)

SpoofSentry includes a direct intake method allowing security operators and students to authenticate with their real Google Workspace or Gmail account and inspect live incoming messages.

### Defensive Scope & Security Model
- **Read-Only Scope (`gmail.readonly`):** SpoofSentry requests the minimum necessary permissions to retrieve headers and plain body text for forensic evaluation. It never asks for or uses permissions to send, draft, delete, or alter any emails.
- **In-Memory Session Only:** OAuth access tokens are stored strictly in client browser memory for the active session. Tokens are never persisted to disk, localStorage, or the SQLite database.
- **Graceful Fallback:** If OAuth credentials are not configured, the "Connect Gmail" button is gracefully disabled with setup instructions while the "Header & Body Fields" and "Upload .eml" intake tabs remain 100% functional.

### Setting Up Google Cloud OAuth & Gmail API
To run SpoofSentry in Gmail-connected mode:

1. **Open Google Cloud Console:** Go to [console.cloud.google.com](https://console.cloud.google.com) and create or select a project.
2. **Enable the Gmail API:**
   - In the sidebar, navigate to **APIs & Services > Library**.
   - Search for **Gmail API** and click **Enable**.
3. **Configure OAuth Consent Screen:**
   - Navigate to **APIs & Services > OAuth consent screen**.
   - Choose **External** (or **Internal** for Workspace organizations).
   - Provide an App name (e.g. `SpoofSentry`), user support email, and developer contact email.
   - Under **Scopes**, click **Add or Remove Scopes** and select `https://www.googleapis.com/auth/gmail.readonly`.
   - If using **External** in testing mode, add your Gmail address under **Test users**.
4. **Create OAuth 2.0 Web Client ID:**
   - Navigate to **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: `SpoofSentry Web Client`.
   - **Authorized JavaScript origins:** Add `http://localhost:3000` (and your hosted preview URL if deployed).
   - Click **Create** and copy your **Client ID** (format: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com`).
5. **Configure Environment Variable:**
   - Add your Client ID to your environment or `.env` file:
     ```bash
     GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
     ```
6. **Analyze Live Emails:**
   - Launch SpoofSentry, open the **Analyzer** tab, and click **CONNECT GMAIL**.
   - Click **CONNECT GMAIL ACCOUNT** to authorize read-only access.
   - Click **ANALYZE** on any recent message to extract its headers and body and run the full SPF/DKIM/DMARC and content analysis engine.

---

## 🏛️ Architecture Summary

SpoofSentry employs a modular, two-tier architecture cleanly separating detection mechanics from the presentation layer:
1. **Core Engine (`detector.py`):** Houses standalone, single-responsibility modules:
   - `EmailParser`: Extracts address tuples, domains, and MIME multipart payloads from raw strings or `.eml` files.
   - `AuthenticationValidator`: Queries live DNS TXT records (`dnspython` with fallback to Google Public DNS API) to check `v=spf1` policies, `{selector}._domainkey.{domain}` DKIM public keys, and `_dmarc.{domain}` policy actions (`p=reject|quarantine|none`).
   - `ContentAnalyzer`: Scans subject and message bodies against categorized rule dictionaries for pressure/urgency phrases, financial/wire requests, account scare threats, and raw-IP link evasions to generate a 0–100 risk score and LOW/MEDIUM/HIGH rating.
   - `TimingAnalyzer`: Parses the RFC 5322 `Date` header to detect off-hours transmissions (23:00 to 06:00).
   - `SpoofDetector`: Synthesizes domain alignment (From vs. Return-Path), DNS auth passes/fails, and content escalation rules to deliver a structured JSON verdict: `LEGITIMATE`, `SUSPICIOUS`, or `SPOOFED`.
2. **Web Layer (`app.py`):** A lightweight Flask application utilizing SQLite (`sqlite3`) for user accounts and historical analysis audit logging, secured with `werkzeug.security` password hashing and session-based authentication guards.

---

## ⚠️ Known Limitations & Academic Scope

To maintain educational clarity and avoid requiring a full live Mail Transfer Agent (MTA) server deployment, the following deliberate architectural boundaries are documented:

1. **SPF Sending IP Validation:**
   - *Current Implementation:* Validates that the sender domain publishes a valid `v=spf1` TXT record in public DNS and evaluates the domain's qualifier policy (`-all`, `~all`, etc.).
   - *Limitation:* Does not cross-reference the connecting client's SMTP relay IP against the IP ranges specified in the SPF mechanisms (e.g. `ip4:`, `include:`), because standalone headers and `.eml` files do not include the live TCP socket connection of the receiving MTA.

2. **DKIM Cryptographic Signature Verification:**
   - *Current Implementation:* Extracts the selector `s=` and domain `d=` tags from the `DKIM-Signature` header, queries DNS at `{selector}._domainkey.{domain}`, and verifies that a valid public key (`p=...` / `v=DKIM1`) is published.
   - *Limitation:* Does not perform full mathematical RSA/Ed25519 hash validation over canonicalized header and body byte streams. In production MTAs, canonicalization and cryptographic verification ensure message transit integrity.

---

## 🧪 Included Test Cases

Run `python3 test_detector.py` to see the real DNS evaluation of:
- **Test Case 1 (Legitimate):** Google Security Notification (`accounts.google.com`) with aligned Return-Path, valid SPF, published DKIM selector `20230601`, and DMARC `p=reject` ➔ **`LEGITIMATE` (LOW Risk)**.
- **Test Case 2 (Spoofed Attack):** Executive Wire Request with domain mismatch (`company-internal-hq.com` vs `attacker-relay-proxy.xyz`), missing DKIM, urgent wire transfer demands, raw IP links, and a 03:15 AM timestamp ➔ **`SPOOFED` (HIGH Risk)**.
- **Test Case 3 (EML Parser):** Multi-part raw `.eml` byte stream extraction and analysis ➔ **`LEGITIMATE`**.
