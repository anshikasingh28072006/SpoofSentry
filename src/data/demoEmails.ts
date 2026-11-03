import { LucideIcon, Mail, Clock, Calendar, Archive, AlertOctagon, Layers } from 'lucide-react';

export interface DemoEmailMessage {
  id: string;
  threadId: string;
  from: string;
  return_path: string;
  dkim_header: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  riskBadge: string;
  riskColor: string;
}

export interface InboxFilterPreset {
  id: string;
  label: string;
  query: string;
  icon: LucideIcon;
  hint: string;
}

export const INBOX_FILTER_PRESETS: InboxFilterPreset[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    query: 'in:inbox',
    icon: Mail,
    hint: 'Most recent emails'
  },
  {
    id: 'older-1m',
    label: '1+ Month Old',
    query: 'in:inbox older_than:1m',
    icon: Clock,
    hint: 'Emails older than 30 days'
  },
  {
    id: 'older-6m',
    label: '6+ Months Old',
    query: 'in:inbox older_than:6m',
    icon: Calendar,
    hint: 'Emails from half a year ago'
  },
  {
    id: 'older-1y',
    label: 'Oldest / End of Inbox',
    query: 'in:inbox older_than:1y',
    icon: Archive,
    hint: 'Jump directly to the oldest emails in your inbox'
  },
  {
    id: 'spam',
    label: 'Spam & Phishing',
    query: 'in:spam',
    icon: AlertOctagon,
    hint: 'Suspicious messages quarantined by Gmail'
  },
  {
    id: 'all',
    label: 'All Mail',
    query: 'label:all',
    icon: Layers,
    hint: 'Entire mailbox including archived records'
  }
];

export const DEMO_INBOX: DemoEmailMessage[] = [
  // Page 1 Items (Recent 2026 emails)
  {
    id: 'demo-wire-01',
    threadId: 't-01',
    from: '"Executive Desk" <ceo-office@company-partner.xyz>',
    return_path: '<bounce@random-phishing-site42.net>',
    dkim_header: '',
    subject: 'URGENT: Executive Wire Transfer Approval Required',
    date: 'Mon, 31 Aug 2026 03:15:00 +0000',
    snippet: 'Please process the wire transfer immediately. Confirm bank routing number within 24 hours to prevent account suspension. Verify at http://185.23.11.9/confirm',
    body: `Attention Accounts Payable,

Please execute the attached urgent vendor wire transfer immediately. Confirm the bank routing number and account details within 24 hours. Failure to comply will result in delayed partner payment and contract cancellation.

Verify wire portal: http://185.23.11.9/confirm
Routing: 021000021
Direct Deposit Ref: INV-99482

Regards,
Executive Leadership Office`,
    riskBadge: 'Urgent Wire Threat',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-google-02',
    threadId: 't-02',
    from: '"Google Security Alerts" <no-reply@accounts.google.com>',
    return_path: '<no-reply@accounts.google.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=accounts.google.com; s=20230601; c=relaxed/relaxed',
    subject: 'Security review for your Google Account',
    date: 'Mon, 31 Aug 2026 14:30:00 +0000',
    snippet: 'A routine sign-in on your Google Account was detected on a registered device. If this was you, no action is needed.',
    body: `Hi Anshika,

Your Google Account is operating normally. A routine sign-in was detected on your registered browser session.

If this was you, no action is required. You can review your account security settings anytime at https://myaccount.google.com/security

Best regards,
Google Accounts Security Team`,
    riskBadge: 'Legitimate Notice',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-paypal-03',
    threadId: 't-03',
    from: '"PayPal Account Security" <service@paypaI-notification-center.com>',
    return_path: '<alerts@scam-forwarder-vps.net>',
    dkim_header: '',
    subject: 'Action Required: Unauthorized Access Detected on your PayPal Account',
    date: 'Sun, 30 Aug 2026 01:45:00 +0000',
    snippet: 'We noticed unusual activity from Frankfurt, Germany. Please confirm your billing details within 24 hours to prevent permanent deactivation.',
    body: `Dear Customer,

Your account will be suspended due to unauthorized access from an unrecognized device in Frankfurt, Germany.

To prevent permanent account deactivation, verify your identity within 24 hours by updating your credit card details and bank routing number.

Visit our resolution portal: http://45.33.32.156/paypal/verify.html

Thank you,
PayPal Customer Safety`,
    riskBadge: 'Credential Harvester',
    riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'demo-hr-04',
    threadId: 't-04',
    from: '"HR Direct" <payroll-update@secure-workday-portal.top>',
    return_path: '<spoof-sender@bulletproof-hosting.ru>',
    dkim_header: '',
    subject: 'Mandatory: Review your Q2 2026 Tax Withholding Statement',
    date: 'Thu, 27 Aug 2026 09:12:00 +0000',
    snippet: 'All employees must verify direct deposit credentials before Friday to avoid paycheck delay. Click to authenticate via Workday SSO.',
    body: `Dear Associate,

Our human resources system is undergoing compliance synchronization. All staff are required to re-verify their bank account routing numbers and tax withholdings.

Failure to complete verification by Friday will cause a temporary hold on your payroll direct deposit.

Access portal: https://login.workday-verify.top/sso/auth

Human Resources Operations`,
    riskBadge: 'Payroll Impersonation',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-github-05',
    threadId: 't-05',
    from: '"GitHub" <noreply@github.com>',
    return_path: '<noreply@github.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=github.com; s=pf2014; c=relaxed/relaxed',
    subject: '[GitHub] A personal access token has expired',
    date: 'Wed, 26 Aug 2026 11:20:00 +0000',
    snippet: 'Your personal access token "deployment-key-ci" has expired. Please generate a new token if continuous integration depends on it.',
    body: `Hi Anshika,

We wanted to let you know that your personal access token (deployment-key-ci) has expired.

To generate a new token, visit https://github.com/settings/tokens.

Thanks,
The GitHub Team`,
    riskBadge: 'Legitimate Developer Alert',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-docusign-06',
    threadId: 't-06',
    from: '"DocuSign Service" <docusign@signatures-online-cloud.com>',
    return_path: '<bounce@phish-delivery.org>',
    dkim_header: '',
    subject: 'Completed: Please DocuSign Confidential Severance Agreement',
    date: 'Tue, 25 Aug 2026 23:45:00 +0000',
    snippet: 'Legal Counsel has sent you a document to review and sign. Please click the link below to access your secure document envelope.',
    body: `DocuSign Document Delivery

You have received a confidential document for electronic signature from Legal & Operations.
Document ID: DOC-2026-99182
Expires in 12 hours.

Review and Sign: http://193.106.191.24/docusign/envelope.php

Thank you,
DocuSign Secure Delivery Team`,
    riskBadge: 'Suspicious Signature Phish',
    riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'demo-m365-07',
    threadId: 't-07',
    from: '"Microsoft 365 Admin" <admin@microsoft-security-gateway.info>',
    return_path: '<relay@bulletproof-dns.xyz>',
    dkim_header: '',
    subject: 'Password Expiry: 6 Incoming Messages on Hold in Quarantine',
    date: 'Mon, 24 Aug 2026 08:30:00 +0000',
    snippet: 'Your Microsoft Office 365 password expires today. 6 incoming messages have been quarantined. Retain password to release messages.',
    body: `Microsoft Online Protection

Notice ID: MS-3918290-SEC
User: anshika8422@gmail.com

Your account password will expire in 6 hours. Six incoming messages from external partners are currently queued in the tenant quarantine.

Keep Current Password & Release Messages:
https://login.microsoft-tenant-auth.info/retain?usr=anshika8422

IT Security Helpdesk`,
    riskBadge: 'Office 365 Quota Scam',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-stripe-08',
    threadId: 't-08',
    from: '"Stripe Support" <notifications@stripe.com>',
    return_path: '<notifications@stripe.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=stripe.com; s=k1; c=relaxed/relaxed',
    subject: 'Your daily payout of $4,850.00 is on its way',
    date: 'Sun, 23 Aug 2026 18:00:00 +0000',
    snippet: 'Stripe payout #po_1Nskd92eZvKYlo2C has been initiated to your bank account ending in 4102. Expected arrival within 1-2 business days.',
    body: `Hi Anshika,

We initiated a payout of $4,850.00 USD to your bank account ending in 4102.

Payout ID: po_1Nskd92eZvKYlo2C
Estimated Arrival: Tuesday, August 25, 2026

You can track your payout status anytime in the Stripe Dashboard at https://dashboard.stripe.com/payouts.

The Stripe Team`,
    riskBadge: 'Legitimate Financial Notice',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-apple-09',
    threadId: 't-09',
    from: '"Apple Support" <receipt@apple-store-invoicing.net>',
    return_path: '<bounce@spam-engine-online.cc>',
    dkim_header: '',
    subject: 'Your Invoice for 2TB iCloud+ Subscription ($99.99/yr)',
    date: 'Sat, 22 Aug 2026 12:15:00 +0000',
    snippet: 'Thank you for your renewal. If you did not authorize this auto-charge on your Apple ID, dispute the invoice within 24 hours.',
    body: `Apple Invoice

Invoice No: INV-APL-882194
Order Date: Aug 22, 2026
Total Amount: $99.99

Item: 2TB iCloud+ Storage Plan (Annual)
Billed To: MasterCard ending in 7099

Did not make this purchase?
Cancel and request instant refund here:
http://appleid-dispute-cancellation.net/refund.html

Apple Support`,
    riskBadge: 'Invoice Impersonation',
    riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'demo-netflix-10',
    threadId: 't-10',
    from: '"Netflix Billing" <support@netflix-account-membership.live>',
    return_path: '<noreply@vps-spoofer-relay.ru>',
    dkim_header: '',
    subject: 'Notice: Your membership is on pause due to billing problem',
    date: 'Fri, 21 Aug 2026 05:40:00 +0000',
    snippet: 'We were unable to process your payment for the next billing cycle. Please update your payment method to restart your membership.',
    body: `We are having trouble with your current billing information.

Please update your credit card or PayPal payment method to avoid account cancellation.

Update Payment: http://netflix-billing-update.live/signin

The Netflix Team`,
    riskBadge: 'Subscription Phishing',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },

  // Page 2 Items (Mid-2026 & Early 2026)
  {
    id: 'demo-linkedin-11',
    threadId: 't-11',
    from: '"LinkedIn" <messages-noreply@linkedin.com>',
    return_path: '<messages-noreply@linkedin.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=linkedin.com; s=proddkim1024; c=relaxed/relaxed',
    subject: 'Elena Rostova sent you a message: "Collaboration on Security Audit"',
    date: 'Thu, 20 Aug 2026 14:10:00 +0000',
    snippet: 'Elena Rostova (Lead Security Architect at CloudShield): "Hi Anshika, I saw your recent write-up on email authentication alignment..."',
    body: `Hi Anshika,

Elena Rostova sent you a new direct message on LinkedIn:

"Hi Anshika, I saw your recent writeup on email authentication alignment and DMARC enforcement. We are looking for an advisor for our team—are you open to chatting next week?"

View and reply: https://www.linkedin.com/messaging/thread/7892019/

LinkedIn Corporation`,
    riskBadge: 'Legitimate Social Notice',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-fedex-12',
    threadId: 't-12',
    from: '"FedEx Delivery Manager" <tracking@fedex-express-logistics.top>',
    return_path: '<mail@phish-delivery-node.org>',
    dkim_header: '',
    subject: 'Package Tracking #99482910: Delivery exception requires address confirmation',
    date: 'Wed, 19 Aug 2026 17:30:00 +0000',
    snippet: 'Courier was unable to deliver your package because house number is missing. Update address within 48 hours to reschedule.',
    body: `FedEx Express Notification

Tracking Number: 99482910-FDX
Status: Delivery Attempt Failed - Incomplete Street Address

Your package is being held at the regional terminal. An administrative redelivery fee of $1.95 is required to release the courier hold.

Reschedule Delivery:
http://fedex-redelivery-portal.top/track.php?id=99482910

FedEx Customer Support`,
    riskBadge: 'Smishing / Delivery Fraud',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-jira-13',
    threadId: 't-13',
    from: '"Atlassian Cloud" <jira@atlassian.net>',
    return_path: '<jira@atlassian.net>',
    dkim_header: 'v=1; a=rsa-sha256; d=atlassian.net; s=atlassian-2022; c=relaxed/relaxed',
    subject: '[JIRA] (SEC-409) Implement DMARC reject enforcement across subdomain delegations',
    date: 'Tue, 18 Aug 2026 10:05:00 +0000',
    snippet: 'Marcus Chen assigned SEC-409 to you: "Priority: High. Please verify SPF lookups do not exceed the 10-DNS limit."',
    body: `Marcus Chen assigned an issue to you:

Project: Cybersecurity Infrastructure (SEC)
Issue: SEC-409: Implement DMARC reject enforcement
Priority: High

Description:
Review SPF include chains for all transactional mailers (SendGrid, Mailgun, AWS SES). Verify that DNS queries remain <= 10.

View Issue: https://cyberlab.atlassian.net/browse/SEC-409

Atlassian Jira`,
    riskBadge: 'Legitimate DevOps Ticket',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-bank-14',
    threadId: 't-14',
    from: '"Bank of America Fraud Department" <fraud-alert@bofa-protection-center.com>',
    return_path: '<spoof@scam-server-direct.net>',
    dkim_header: '',
    subject: 'Urgent: Suspicious wire transfer of $7,200.00 to Crypto Exchange',
    date: 'Mon, 17 Aug 2026 21:14:00 +0000',
    snippet: 'Did you authorize a wire transfer of $7,200.00 to Kraken Crypto Inc? If NOT, cancel transaction immediately.',
    body: `Bank of America Security Alert

We detected an outgoing wire transfer from your checking account ending in 8912:
Amount: $7,200.00 USD
Beneficiary: Kraken Digital Assets LLC
Date: Aug 17, 2026 21:10 UTC

If you DID NOT authorize this wire, you must cancel it immediately before final settlement:
http://bofa-dispute-wire.com/cancel?id=992819

Bank of America Fraud Division`,
    riskBadge: 'Urgent Banking Phish',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-zoom-15',
    threadId: 't-15',
    from: '"HR Leadership" <meetings@zoom-invitation-corporate.link>',
    return_path: '<attacker@malicious-redirect-dns.com>',
    dkim_header: '',
    subject: 'Mandatory Company All-Hands: Q3 Organizational Restructuring Discussion',
    date: 'Sun, 16 Aug 2026 07:00:00 +0000',
    snippet: 'Join the mandatory executive meeting with CEO and HR regarding headcount restructuring and employee performance evaluations.',
    body: `Dear Team,

Please join us for a mandatory company briefing regarding executive realignment and Q3 organizational updates.

Meeting Time: 10:00 AM EST
Passcode: Not required

Join Meeting: http://zoom-conference-join.link/room/88129031?auth=sso

Human Resources`,
    riskBadge: 'Executive Meeting Bait',
    riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },

  // Page 3 Items (Older than 1 Month & 6 Months)
  {
    id: 'demo-figma-16',
    threadId: 't-16',
    from: '"Figma" <support@figma.com>',
    return_path: '<support@figma.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=figma.com; s=figma2023; c=relaxed/relaxed',
    subject: 'David Kim shared the design file "Security Operations Dashboard v2" with you',
    date: 'Thu, 02 Jul 2026 15:22:00 +0000',
    snippet: 'David Kim (david.kim@designstudio.io) invited you to edit "Security Operations Dashboard v2" in the Figma workspace.',
    body: `Hi Anshika,

David Kim has invited you to collaborate on the file:
"Security Operations Dashboard v2"

Open File in Figma: https://www.figma.com/file/aBcdEfg1234/Security-Operations-Dashboard

Happy designing!
The Figma Team`,
    riskBadge: 'Legitimate Collaboration',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-it-helpdesk-17',
    threadId: 't-17',
    from: '"Global IT Helpdesk" <helpdesk@corporate-sso-portal.xyz>',
    return_path: '<attacker@darknet-relay.cc>',
    dkim_header: '',
    subject: 'Action Required: Upgrade Okta Verify 2FA token before Monday',
    date: 'Mon, 29 Jun 2026 11:45:00 +0000',
    snippet: 'Corporate security policies require all personnel to re-bind their Okta FastPass authenticator certificate immediately.',
    body: `Internal IT Announcement

Reference: SEC-MFA-2026
To: All Corporate Staff

Due to security certificate expiration on corporate radius servers, all employees must re-enroll their Okta MFA devices.

Re-enroll device: http://okta-sso-reenrollment.xyz/fastpass

Failure to register will disable VPN and email access.

Global IT Operations`,
    riskBadge: 'MFA Fatigue / Token Stealer',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-aws-18',
    threadId: 't-18',
    from: '"Amazon Web Services" <no-reply-aws@amazon.com>',
    return_path: '<no-reply-aws@amazon.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=amazon.com; s=20210324; c=relaxed/relaxed',
    subject: 'ALARM: "API-Latency-High" in US-East-1 triggered',
    date: 'Sat, 20 Jun 2026 04:12:00 +0000',
    snippet: 'CloudWatch alarm API-Latency-High state changed from OK to ALARM. Metric p99 latency reached 412ms exceeding threshold of 300ms.',
    body: `AWS CloudWatch Notification

Alarm Details:
- Name: API-Latency-High
- State Change: OK -> ALARM
- Reason: Threshold Crossed: 1 datapoint (412.3 ms) was greater than the threshold (300.0 ms).
- Region: us-east-1

View CloudWatch Alarm:
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:alarm/API-Latency-High

Amazon Web Services`,
    riskBadge: 'Legitimate Cloud Alarm',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-dropbox-19',
    threadId: 't-19',
    from: '"Dropbox Notification" <share@dropbox-cloud-storage.info>',
    return_path: '<scam@phishing-vps-55.net>',
    dkim_header: '',
    subject: 'CFO Office shared "Q2 Compensation & Bonus Allocations.xlsx" with you',
    date: 'Wed, 10 Jun 2026 09:30:00 +0000',
    snippet: 'You have been granted view access to confidential payroll spreadsheet. Log in with corporate credentials to decrypt.',
    body: `Dropbox Shared Document

Document: Q2 Compensation & Bonus Allocations.xlsx
Shared by: cfo-office@company.com
File Size: 4.8 MB

Access Secure Spreadsheet:
http://dropbox-document-decrypt.info/view.php?token=99281

Dropbox File Sharing`,
    riskBadge: 'Spear Phishing Document',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-dhl-20',
    threadId: 't-20',
    from: '"DHL Express Customs" <customs@dhl-clearance-support.vip>',
    return_path: '<bounce@spammer-gateway.org>',
    dkim_header: '',
    subject: 'Duty & VAT Outstanding: Shipment #WAYBILL-881920 held at customs',
    date: 'Fri, 22 May 2026 16:50:00 +0000',
    snippet: 'Customs declaration fee of $4.80 is required to dispatch international consignment to destination address.',
    body: `DHL Express Courier Services

Waybill: 881920-DHL
Origin: Frankfurt, DE
Destination: San Jose, US

Your parcel is waiting for clearance. An unpaid customs duty of $4.80 is outstanding.

Pay customs duty online:
http://dhl-clearance-online.vip/pay

DHL Customer Support`,
    riskBadge: 'Fee Fraud / Card Stealer',
    riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },

  // Page 4 Items (Older than 1 Year / Deep Archives - 2025 & 2024)
  {
    id: 'demo-amazon-21',
    threadId: 't-21',
    from: '"Amazon Customer Support" <order-update@amazon-security-dept.info>',
    return_path: '<mailer@mailer-daemon-spoofer.net>',
    dkim_header: '',
    subject: 'Your Amazon order #112-9984921-00291 has been charged $1,499.00',
    date: 'Wed, 14 Aug 2024 16:30:00 +0000',
    snippet: 'Thank you for purchasing Apple MacBook Pro M3. If you did not place this order, call fraud protection immediately at +1-800-555-0199.',
    body: `Amazon Order Confirmation

Order #112-9984921-00291
Item: Apple MacBook Pro 16" Space Black ($1,499.00)
Shipped to: 742 Evergreen Terrace, Springfield

If you did NOT authorize this transaction, call our 24/7 Fraud Prevention Desk immediately at +1-800-555-0199 or click http://amazon-cancel-order.info/verify.

Amazon Customer Care`,
    riskBadge: 'Refund Scam (2024 Archive)',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-slack-22',
    threadId: 't-22',
    from: '"Slack" <notification@slack.com>',
    return_path: '<notification@slack.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=slack.com; s=20210201; c=relaxed/relaxed',
    subject: 'New login to your Slack workspace from macOS',
    date: 'Mon, 10 Jun 2024 10:00:00 +0000',
    snippet: 'Your Slack account was recently used to log in from Chrome on macOS in San Jose, CA.',
    body: `Hi Anshika,

We detected a login to your Slack account on CyberSec Lab workspace from Google Chrome on macOS.

Location: San Jose, California
IP Address: 198.51.100.22

If this was you, you can ignore this email. If this wasn't you, reset your password immediately.

The Slack Team`,
    riskBadge: 'Legitimate Slack Notice',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-geek-squad-23',
    threadId: 't-23',
    from: '"Geek Squad Total Support" <billing@geeksquad-renewals-center.com>',
    return_path: '<relay@phish-farm-net.cc>',
    dkim_header: '',
    subject: 'Invoice #GS-992019: Auto-renewal charge of $499.99 successfully billed',
    date: 'Tue, 14 May 2024 09:15:00 +0000',
    snippet: 'Your Best Buy Geek Squad 3-year subscription has auto-renewed for $499.99. Call toll-free to dispute or request refund.',
    body: `Best Buy Geek Squad Protection

Invoice: GS-992019
Annual Service: Cyber Security & PC Shield 2024-2027
Total: $499.99

This transaction has appeared on your bank statement. If you wish to cancel and claim a 100% refund, contact our refund billing desk immediately:
Toll-Free: +1-888-555-0144

Geek Squad Team`,
    riskBadge: 'Call Center Refund Scam',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-adobe-24',
    threadId: 't-24',
    from: '"Adobe Systems" <message@adobe.com>',
    return_path: '<message@adobe.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=adobe.com; s=adobe1; c=relaxed/relaxed',
    subject: 'Your Adobe Creative Cloud subscription renewed',
    date: 'Fri, 12 Apr 2024 14:00:00 +0000',
    snippet: 'Your Creative Cloud All Apps membership renewed on April 12, 2024. Your payment of $54.99 was processed.',
    body: `Hi Anshika,

Thanks for your payment! Here are your subscription renewal details:

Plan: Creative Cloud All Apps (Annual, paid monthly)
Amount: $54.99 USD
Payment Method: Visa ending in 4102

Manage your subscription anytime at https://account.adobe.com/plans.

Adobe Customer Support`,
    riskBadge: 'Legitimate Adobe Invoice',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-wells-fargo-25',
    threadId: 't-25',
    from: '"Wells Fargo Online" <security@wellsfargo-verify-security.org>',
    return_path: '<spoofer@bulletproof-hosting-nl.com>',
    dkim_header: '',
    subject: 'Security Alert: Your Wells Fargo online banking session is restricted',
    date: 'Mon, 18 Mar 2024 03:40:00 +0000',
    snippet: 'Multiple failed PIN attempts detected. Enter your account credentials and debit card details to unlock online access.',
    body: `Wells Fargo Online Banking Notice

Customer ID: WF-88192
Status: Temporary Access Suspension

We placed a security hold on your account after 3 incorrect passcode entries.

To restore access:
http://wellsfargo-verify-security.org/login.php

Wells Fargo Security Division`,
    riskBadge: 'Bank Credential Stealer',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-irs-26',
    threadId: 't-26',
    from: '"Internal Revenue Service" <refunds@irs-tax-gov-portal.com>',
    return_path: '<bounce@fraudulent-mailer.net>',
    dkim_header: '',
    subject: 'Tax Refund Notification: Unclaimed refund of $1,842.50 pending',
    date: 'Tue, 13 Feb 2024 18:20:00 +0000',
    snippet: 'Internal Revenue Service records indicate you are eligible for an additional federal tax refund. Submit direct deposit form.',
    body: `Internal Revenue Service (IRS)

Taxpayer Identification Notice:
Our recalculation of your 2023 Form 1040 reveals an overpayment credit of $1,842.50.

Submit Electronic Refund Claim:
http://irs-tax-gov-portal.com/direct-deposit.html

IRS Taxpayer Advocacy Group`,
    riskBadge: 'Federal Tax Impersonation',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-ceo-whaling-27',
    threadId: 't-27',
    from: '"CEO Desk" <chief-executive-direct@gmail-corporate-alias.xyz>',
    return_path: '<spoofer@scam-mail-server.com>',
    dkim_header: '',
    subject: 'Quick favor - Are you at your desk right now?',
    date: 'Thu, 11 Jan 2024 11:05:00 +0000',
    snippet: 'I am in a confidential board meeting and cannot talk on the phone. Need you to purchase 5 Apple gift cards for partner presentation.',
    body: `Hi Anshika,

Are you available right now? I am currently tied up in an offsite executive board meeting and need an urgent favor.

Please purchase 5 Apple gift cards ($100 each) for an emergency client presentation. Scratch off the backs, take clear photos of the codes, and email them back to me directly.

I will have accounting reimburse you by end of day.

Thanks,
Executive Director`,
    riskBadge: 'Whaling / Gift Card Scam',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-twitter-28',
    threadId: 't-28',
    from: '"X / Twitter" <info@x.com>',
    return_path: '<info@x.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=x.com; s=dkim2023; c=relaxed/relaxed',
    subject: 'Your single-use confirmation code is 894102',
    date: 'Wed, 20 Dec 2023 19:40:00 +0000',
    snippet: 'Use code 894102 to verify your X account login. Code expires in 10 minutes.',
    body: `Hi Anshika,

Here is your verification code:
894102

This code was requested from Chrome on Windows. If you did not request this, you can safely ignore this email.

The X Team`,
    riskBadge: 'Legitimate 2FA Code',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-norton-29',
    threadId: 't-29',
    from: '"Norton LifeLock Support" <billing@norton-renewal-billing.net>',
    return_path: '<mailer@relay-phish-box.ru>',
    dkim_header: '',
    subject: 'Order Processed: Norton 360 Deluxe auto-debited $349.99 from checking',
    date: 'Mon, 13 Nov 2023 08:20:00 +0000',
    snippet: 'Thank you for choosing Norton LifeLock. $349.99 has been deducted from your account. To reverse transaction, call +1-888-555-0182.',
    body: `Norton LifeLock Cyber Safety

Subscription ID: NL-993819
Product: Norton 360 Platinum Multi-Device (2023-2026)
Total Charged: $349.99

If you did not approve this recurring auto-renewal, call our Cancellation Help Desk within 24 hours:
Phone: +1-888-555-0182

Norton Support`,
    riskBadge: 'Antivirus Renewal Scam',
    riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-gcp-30',
    threadId: 't-30',
    from: '"Google Cloud Platform" <cloud-billing-alerts@google.com>',
    return_path: '<cloud-billing-alerts@google.com>',
    dkim_header: 'v=1; a=rsa-sha256; d=google.com; s=20230601; c=relaxed/relaxed',
    subject: 'Budget alert: "Production-Infrastructure" exceeded 85% of monthly budget',
    date: 'Wed, 04 Oct 2023 22:15:00 +0000',
    snippet: 'Your Google Cloud budget "Production-Infrastructure" reached $854.20, which is 85.4% of your $1,000.00 monthly target.',
    body: `Google Cloud Billing Alert

Project: prod-cybersec-engine
Budget Name: Production-Infrastructure
Target Budget: $1,000.00 USD
Current Spend: $854.20 USD (85.4%)

You are receiving this alert because spend has surpassed the 85% threshold.

View Billing Report:
https://console.cloud.google.com/billing/reports

Google Cloud Billing`,
    riskBadge: 'Legitimate Cloud Billing Alert (Deep Archive)',
    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
];
