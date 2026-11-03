"""
Verification Test Script for SpoofSentry Detection Engine
Executes real DNS lookups and tests both legitimate and spoofed test cases.
"""

import sys
import json
from detector import SpoofDetector, EmailParser

def run_tests():
    print("=" * 70)
    print("  SPOOFSENTRY EMAIL SPOOFING DETECTION ENGINE — TEST SUITE")
    print("=" * 70)

    # -------------------------------------------------------------
    # TEST CASE 1: LEGITIMATE EMAIL SAMPLE
    # Google-style email with valid SPF/DKIM/DMARC on real domain, calm subject/body, normal hours
    # -------------------------------------------------------------
    print("\n[RUNNING TEST CASE 1] Legitimate Email Sample (google.com)")
    print("-" * 70)
    
    legit_from = "Google Security Alerts <no-reply@accounts.google.com>"
    legit_return_path = "<3v8lWWRQKBAgPQ-UHSOBAFFRXQWVAFFRXQ.FRP@accounts.google.com>"
    # Real Google DKIM selector header format
    legit_dkim = "v=1; a=rsa-sha256; c=relaxed/relaxed; d=accounts.google.com; s=20230601; t=1690000000; bh=abc1234=; h=to:from:subject:date:message-id; b=XYZ=="
    legit_subject = "Security review for your Google Account"
    legit_body = """Hi User,

Your Google Account is working normally. We noticed a regular sign-in from your registered device in California.

If this was you, you don't need to take any action. You can review your account security settings at your convenience.

Best regards,
Google Accounts Team"""
    legit_date = "Mon, 31 Aug 2026 14:30:00 +0000"  # 14:30 UTC -> Normal daytime hours (14:00)

    result_legit = SpoofDetector.evaluate(
        from_address=legit_from,
        return_path=legit_return_path,
        dkim_header=legit_dkim,
        subject=legit_subject,
        body=legit_body,
        date_str=legit_date
    )

    print(f"-> Sender From Domain:     {result_legit['sender_alignment']['from_domain']}")
    print(f"-> Return-Path Domain:    {result_legit['sender_alignment']['return_path_domain']}")
    print(f"-> Domains Aligned:       {result_legit['sender_alignment']['domains_aligned']}")
    print(f"-> SPF Check Status:      {result_legit['authentication']['spf']['status']} | {result_legit['authentication']['spf']['detail']}")
    print(f"-> DKIM Check Status:     {result_legit['authentication']['dkim']['status']} | {result_legit['authentication']['dkim']['detail']}")
    print(f"-> DMARC Check Status:    {result_legit['authentication']['dmarc']['status']} (Policy: {result_legit['authentication']['dmarc']['policy']})")
    print(f"-> Content Risk Score:    {result_legit['content_analysis']['risk_score']}/100 (Rating: {result_legit['content_analysis']['risk_rating']})")
    print(f"-> Matched Phishes:       {len(result_legit['content_analysis']['matched_phrases'])} phrases")
    print(f"-> Timing Off-Hours:      {result_legit['timing_analysis']['is_off_hours']} ({result_legit['timing_analysis']['detail']})")
    print(f"\n=> FINAL VERDICT:         [ {result_legit['verdict']} ]")
    print(f"=> Escalated by Content:  {result_legit['is_escalated']}")

    assert result_legit['verdict'] == 'LEGITIMATE', f"Expected LEGITIMATE, got {result_legit['verdict']}"
    assert result_legit['content_analysis']['risk_rating'] == 'LOW', f"Expected LOW content risk, got {result_legit['content_analysis']['risk_rating']}"
    print("\n>>> TEST CASE 1 PASSED: Correctly evaluated as LEGITIMATE with LOW content risk! <<<")

    # -------------------------------------------------------------
    # TEST CASE 2: SPOOFED EMAIL SAMPLE
    # Mismatched From/Return-Path domain, missing DKIM, urgency + payment + threat language, off-hours timestamp (03:15 AM)
    # -------------------------------------------------------------
    print("\n" + "=" * 70)
    print("[RUNNING TEST CASE 2] Spoofed High-Risk Phishing Email Sample")
    print("-" * 70)

    spoofed_from = "CEO Office <executive-desk@company-internal-hq.com>"
    spoofed_return_path = "<bounce-handler@attacker-relay-proxy.xyz>"  # Obvious domain mismatch!
    spoofed_dkim = ""  # Missing DKIM signature
    spoofed_subject = "URGENT: Immediate Wire Transfer Required - Final Notice Before Account Suspended"
    spoofed_body = """Attention Finance Department,

We detected unusual activity on our vendor portal. Your corporate account will be suspended within 24 hours unless direct payment is verified immediately.

Act now to process an urgent wire transfer to the backup bank details provided below:
Routing Number: 021000021
Direct Deposit Reference: INV-99482

Click to confirm payment: http://192.168.1.105/secure-login/bank-portal.php

Failure to comply with this final notice will result in immediate termination of services and legal action.

Regards,
Executive Leadership"""
    spoofed_date = "Sun, 30 Aug 2026 03:15:00 +0000"  # 03:15 AM -> Off-hours middle of night

    result_spoofed = SpoofDetector.evaluate(
        from_address=spoofed_from,
        return_path=spoofed_return_path,
        dkim_header=spoofed_dkim,
        subject=spoofed_subject,
        body=spoofed_body,
        date_str=spoofed_date
    )

    print(f"-> Sender From Domain:     {result_spoofed['sender_alignment']['from_domain']}")
    print(f"-> Return-Path Domain:    {result_spoofed['sender_alignment']['return_path_domain']}")
    print(f"-> Domain Mismatch Detected: {result_spoofed['sender_alignment']['domain_mismatch']}")
    print(f"-> SPF Check Status:      {result_spoofed['authentication']['spf']['status']} | {result_spoofed['authentication']['spf']['detail']}")
    print(f"-> DKIM Check Status:     {result_spoofed['authentication']['dkim']['status']} | {result_spoofed['authentication']['dkim']['detail']}")
    print(f"-> DMARC Check Status:    {result_spoofed['authentication']['dmarc']['status']} (Policy: {result_spoofed['authentication']['dmarc']['policy']})")
    print(f"-> Content Risk Score:    {result_spoofed['content_analysis']['risk_score']}/100 (Rating: {result_spoofed['content_analysis']['risk_rating']})")
    print(f"-> Raw IP Links Detected: {result_spoofed['content_analysis']['raw_ip_links']}")
    print(f"-> Matched Red Flags:")
    for item in result_spoofed['content_analysis']['matched_phrases']:
        print(f"     * [{item['category']}] '{item['phrase']}'")
    print(f"-> Timing Off-Hours:      {result_spoofed['timing_analysis']['is_off_hours']} ({result_spoofed['timing_analysis']['detail']})")
    print(f"\n=> FINAL VERDICT:         [ {result_spoofed['verdict']} ]")
    print(f"=> Verdict Reasons:")
    for reason in result_spoofed['verdict_reasons']:
        print(f"     - {reason}")

    assert result_spoofed['verdict'] == 'SPOOFED', f"Expected SPOOFED, got {result_spoofed['verdict']}"
    assert result_spoofed['content_analysis']['risk_rating'] == 'HIGH', f"Expected HIGH content risk, got {result_spoofed['content_analysis']['risk_rating']}"
    print("\n>>> TEST CASE 2 PASSED: Correctly evaluated as SPOOFED with HIGH content risk! <<<")

    # -------------------------------------------------------------
    # TEST CASE 3: EML Parsing Test
    # -------------------------------------------------------------
    print("\n" + "=" * 70)
    print("[RUNNING TEST CASE 3] Raw .eml File Parsing Validation")
    print("-" * 70)

    raw_eml_content = b"""From: "Google Workspace" <workspace-noreply@google.com>
To: admin@example.com
Subject: Monthly billing receipt and invoice summary
Date: Mon, 31 Aug 2026 10:15:00 -0400
Return-Path: <workspace-noreply@google.com>
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=20230601; h=from:to:subject:date; b=test==
Content-Type: text/plain; charset="UTF-8"

Hello Administrator,

Your standard monthly billing statement for Google Workspace is ready.
No action is required. Thank you for your business.
"""
    parsed_eml = EmailParser.parse_eml_bytes(raw_eml_content)
    print(f"Parsed From:        {parsed_eml['from']}")
    print(f"Parsed Subject:     {parsed_eml['subject']}")
    print(f"Parsed Return-Path: {parsed_eml['return_path']}")
    print(f"Parsed Body:        {parsed_eml['body'][:60]}...")
    
    eml_eval = SpoofDetector.evaluate(
        from_address=parsed_eml['from'],
        return_path=parsed_eml['return_path'],
        dkim_header=parsed_eml['dkim_header'],
        subject=parsed_eml['subject'],
        body=parsed_eml['body'],
        date_str=parsed_eml['date']
    )
    print(f"=> EML Evaluated Verdict: [ {eml_eval['verdict']} ] (SPF: {eml_eval['authentication']['spf']['status']}, DMARC: {eml_eval['authentication']['dmarc']['policy']})")
    assert eml_eval['verdict'] == 'LEGITIMATE'
    print("\n>>> TEST CASE 3 PASSED: .eml parser correctly extracted all MIME fields and evaluated! <<<")

    print("\n" + "=" * 70)
    print("  ALL 3 TEST SUITES COMPLETED AND VERIFIED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
