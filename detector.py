"""
SpoofSentry — Email Spoofing Detection Engine
Cybersecurity Mini-Project: Rule-based detection using DNS authentication,
content analysis, and send-timing heuristics.
"""

import re
import json
import email
from email import policy
from email.utils import parseaddr, parsedate_to_datetime
from datetime import datetime, timezone
import urllib.request
import urllib.error

# DNS resolution: dnspython with fallback to Google Public DNS API (DoH) for portability
try:
    import dns.resolver
    HAS_DNSPYTHON = True
except ImportError:
    HAS_DNSPYTHON = False


def query_txt_records(domain: str) -> list:
    """
    Perform real DNS TXT lookup for a given domain name.
    Uses dnspython if installed, otherwise queries Google DNS-over-HTTPS.
    """
    domain = domain.strip().rstrip('.')
    if not domain:
        return []

    # Method 1: Use dnspython if available
    if HAS_DNSPYTHON:
        try:
            answers = dns.resolver.resolve(domain, 'TXT', lifetime=4.0)
            records = []
            for rdata in answers:
                # rdata.strings is a tuple of bytes parts
                record_text = "".join(s.decode('utf-8', errors='ignore') if isinstance(s, bytes) else str(s) for s in rdata.strings)
                records.append(record_text)
            return records
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout, Exception):
            # Fallback to DoH if dnspython fails or times out
            pass

    # Method 2: Google DNS API fallback (uses standard library urllib, no external package needed)
    try:
        url = f"https://dns.google/resolve?name={urllib.parse.quote(domain)}&type=TXT"
        req = urllib.request.Request(url, headers={'User-Agent': 'SpoofSentry/1.0'})
        with urllib.request.urlopen(req, timeout=4.0) as response:
            data = json.loads(response.read().decode('utf-8'))
            records = []
            for answer in data.get('Answer', []):
                if answer.get('type') == 16:  # TXT record type
                    val = answer.get('data', '').strip('"')
                    records.append(val)
            return records
    except Exception:
        return []


class EmailParser:
    """Parses email headers and raw .eml files to extract metadata and payload."""

    @staticmethod
    def extract_domain(address_field: str) -> str:
        """
        Regex-extracts and normalizes the domain from email address fields
        such as 'Google Security <no-reply@accounts.google.com>' or 'user@domain.com'.
        """
        if not address_field:
            return ""
        
        # Use Python's parseaddr to handle display names
        _, addr = parseaddr(str(address_field))
        target = addr if addr else str(address_field)
        
        match = re.search(r'@([a-zA-Z0-9.\-_]+)', target)
        if match:
            return match.group(1).lower().strip('.')
        return ""

    @classmethod
    def parse_headers(cls, from_field: str, return_path_field: str = "", dkim_field: str = "") -> dict:
        """Parses manually entered email header strings."""
        return {
            "from": from_field.strip() if from_field else "",
            "from_domain": cls.extract_domain(from_field),
            "return_path": return_path_field.strip() if return_path_field else "",
            "return_path_domain": cls.extract_domain(return_path_field),
            "dkim_header": dkim_field.strip() if dkim_field else ""
        }

    @classmethod
    def parse_eml_bytes(cls, raw_bytes: bytes) -> dict:
        """
        Parses raw bytes of an uploaded .eml file using Python's standard `email` module.
        Extracts From, To, Subject, Return-Path, DKIM-Signature, Date, and plain-text Body.
        """
        msg = email.message_from_bytes(raw_bytes, policy=policy.default)

        from_field = msg.get("From", "") or ""
        to_field = msg.get("To", "") or ""
        subject = msg.get("Subject", "") or ""
        return_path = msg.get("Return-Path", "") or ""
        dkim_sig = msg.get("DKIM-Signature", "") or ""
        date_str = msg.get("Date", "") or ""

        # Extract plain text body by walking the MIME parts
        body_text = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))
                if content_type == "text/plain" and "attachment" not in content_disposition:
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or 'utf-8'
                        body_text = payload.decode(charset, errors='replace')
                        break
            # Fallback if no text/plain part was found: check html part and strip tags
            if not body_text:
                for part in msg.walk():
                    if part.get_content_type() == "text/html":
                        payload = part.get_payload(decode=True)
                        if payload:
                            charset = part.get_content_charset() or 'utf-8'
                            raw_html = payload.decode(charset, errors='replace')
                            body_text = re.sub(r'<[^>]+>', ' ', raw_html)
                            break
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or 'utf-8'
                body_text = payload.decode(charset, errors='replace')
            else:
                body_text = str(msg.get_payload() or "")

        return {
            "from": str(from_field),
            "from_domain": cls.extract_domain(str(from_field)),
            "to": str(to_field),
            "subject": str(subject),
            "return_path": str(return_path),
            "return_path_domain": cls.extract_domain(str(return_path)),
            "dkim_header": str(dkim_sig),
            "date": str(date_str),
            "body": body_text.strip()
        }


class AuthenticationValidator:
    """
    Performs real DNS lookups to validate SPF, DKIM public key deployment,
    and DMARC policy for sender domains.
    """

    @staticmethod
    def check_spf(domain: str) -> dict:
        """
        Queries TXT records on the domain to confirm a valid SPF record exists (starts with v=spf1).
        Returns status (PASS/NONE/FAIL) and human-readable detail.
        Note: Checks publisher policy record existence. Real mail-server SPF evaluation also
        cross-checks sending SMTP relay IP against the mechanisms.
        """
        if not domain:
            return {
                "status": "FAIL",
                "detail": "No domain provided for SPF evaluation.",
                "record": None
            }

        records = query_txt_records(domain)
        spf_records = [r for r in records if r.lower().startswith("v=spf1")]

        if not spf_records:
            return {
                "status": "NONE",
                "detail": f"No SPF record published for {domain}. Domain is vulnerable to unauthorized mail origination.",
                "record": None
            }

        spf_rec = spf_records[0]
        # Check qualifier default
        qualifier = "unknown"
        if "-all" in spf_rec:
            qualifier = "hardfail (-all)"
        elif "~all" in spf_rec:
            qualifier = "softfail (~all)"
        elif "?all" in spf_rec:
            qualifier = "neutral (?all)"
        elif "+all" in spf_rec:
            qualifier = "permissive (+all)"

        return {
            "status": "PASS",
            "detail": f"Valid SPF record active on {domain} with {qualifier} policy.",
            "record": spf_rec
        }

    @staticmethod
    def check_dkim(dkim_header: str) -> dict:
        """
        Extracts domain 'd=' and selector 's=' tags from the DKIM-Signature header,
        then performs a DNS TXT lookup at `{selector}._domainkey.{domain}` to verify
        that the sending domain has published a public key record.

        LIMITATION NOTICE (Academic/Student scope):
        This check verifies structural DKIM validity, tag alignment, and public key
        DNS publication. Full cryptographic signature verification (computing the RSA/Ed25519
        hash over headers and canonicalized body) requires raw SMTP byte stream alignment.
        """
        if not dkim_header:
            return {
                "status": "NONE",
                "detail": "No DKIM-Signature header present in message.",
                "domain": None,
                "selector": None,
                "record": None
            }

        # Regex extract d= and s=
        d_match = re.search(r'\bd=([a-zA-Z0-9.\-_]+)', dkim_header)
        s_match = re.search(r'\bs=([a-zA-Z0-9.\-_]+)', dkim_header)

        domain = d_match.group(1).lower() if d_match else None
        selector = s_match.group(1) if s_match else None

        if not domain or not selector:
            return {
                "status": "FAIL",
                "detail": "Malformed DKIM-Signature header: missing required 'd=' (domain) or 's=' (selector) tags.",
                "domain": domain,
                "selector": selector,
                "record": None
            }

        dkim_dns_name = f"{selector}._domainkey.{domain}"
        records = query_txt_records(dkim_dns_name)

        # Look for v=DKIM1 or p= (public key)
        dkim_records = [r for r in records if "p=" in r or "v=dkim1" in r.lower()]

        if dkim_records:
            return {
                "status": "PASS",
                "detail": f"DKIM public key confirmed in DNS at {dkim_dns_name}.",
                "domain": domain,
                "selector": selector,
                "record": dkim_records[0]
            }
        else:
            return {
                "status": "FAIL",
                "detail": f"DKIM selector queried ({dkim_dns_name}) but no public key TXT record was found.",
                "domain": domain,
                "selector": selector,
                "record": None
            }

    @staticmethod
    def check_dmarc(domain: str) -> dict:
        """
        Queries TXT records on `_dmarc.{domain}` to verify DMARC policy deployment
        and extract the policy action (reject, quarantine, or none).
        """
        if not domain:
            return {
                "status": "FAIL",
                "policy": None,
                "detail": "No domain provided for DMARC evaluation.",
                "record": None
            }

        dmarc_dns_name = f"_dmarc.{domain}"
        records = query_txt_records(dmarc_dns_name)
        dmarc_records = [r for r in records if r.strip().startswith("v=DMARC1") or r.strip().startswith("v=dmarc1")]

        if not dmarc_records:
            return {
                "status": "NONE",
                "policy": "none_published",
                "detail": f"No DMARC policy found at {dmarc_dns_name}. Receivers have no enforcement instructions.",
                "record": None
            }

        rec = dmarc_records[0]
        # Extract p= policy tag
        p_match = re.search(r'\bp=([a-zA-Z]+)', rec, re.IGNORECASE)
        policy_action = p_match.group(1).lower() if p_match else "none"

        status = "PASS" if policy_action in ["reject", "quarantine"] else "PASS"

        detail_map = {
            "reject": f"Strong DMARC protection active (p=reject). Unauthorized messages are dropped by receiving MTAs.",
            "quarantine": f"Moderate DMARC protection active (p=quarantine). Suspect messages redirected to spam/quarantine.",
            "none": f"DMARC is in monitoring mode only (p=none). No enforcement against spoofed messages."
        }

        return {
            "status": status,
            "policy": policy_action,
            "detail": detail_map.get(policy_action, f"DMARC record present with policy: {policy_action}."),
            "record": rec
        }


class ContentAnalyzer:
    """
    Performs transparent, rule-based scanning of subject and body content for
    social-engineering indicators, urgency triggers, financial requests, and suspicious links.
    """

    URGENCY_PHRASES = [
        "urgent", "act now", "action required", "within 24 hours", "immediate action",
        "final notice", "your account will be suspended", "account suspended",
        "expires soon", "deadline", "suspended immediately", "verify immediately",
        "time sensitive", "prompt attention", "critical alert", "warning"
    ]

    FINANCIAL_PHRASES = [
        "wire transfer", "bank details", "invoice", "gift card", "routing number",
        "cryptocurrency", "bitcoin", "payment method", "credit card details",
        "direct deposit", "payroll update", "reimbursement", "overdue balance",
        "billing statement", "tax refund", "western union"
    ]

    THREAT_PHRASES = [
        "suspended", "unusual activity", "unauthorized access", "compromised",
        "security breach", "locked account", "terminated", "legal action",
        "law enforcement", "violation detected", "login from unknown device",
        "password expiring", "deactivation"
    ]

    @classmethod
    def analyze(cls, subject: str, body: str) -> dict:
        combined_text = f"{subject} {body}".lower()

        matched_urgency = [p for p in cls.URGENCY_PHRASES if re.search(r'\b' + re.escape(p) + r'\b', combined_text)]
        matched_financial = [p for p in cls.FINANCIAL_PHRASES if re.search(r'\b' + re.escape(p) + r'\b', combined_text)]
        matched_threat = [p for p in cls.THREAT_PHRASES if re.search(r'\b' + re.escape(p) + r'\b', combined_text)]

        # Extract all URLs
        urls = re.findall(r'https?://[^\s<>"\']+', f"{subject} {body}")
        
        # Check for raw IP address in links (e.g. http://192.168.1.1/login or http://45.33.32.156)
        raw_ip_urls = []
        for u in urls:
            ip_match = re.search(r'https?://(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', u)
            if ip_match:
                raw_ip_urls.append(u)

        # Risk scoring algorithm (0 to 100)
        score = 0
        score += min(len(matched_urgency) * 15, 30)
        score += min(len(matched_financial) * 20, 35)
        score += min(len(matched_threat) * 15, 30)
        
        if urls:
            score += min(len(urls) * 5, 15)
        if raw_ip_urls:
            score += 30  # Substantial penalty for naked IP addresses in links

        score = min(score, 100)

        # Rating categorization
        if score >= 60:
            rating = "HIGH"
        elif score >= 30:
            rating = "MEDIUM"
        else:
            rating = "LOW"

        matched_details = []
        for phrase in matched_urgency:
            matched_details.append({"phrase": phrase, "category": "Urgency / Pressure"})
        for phrase in matched_financial:
            matched_details.append({"phrase": phrase, "category": "Financial / Payment"})
        for phrase in matched_threat:
            matched_details.append({"phrase": phrase, "category": "Account Threat / Scare"})

        return {
            "risk_score": score,
            "risk_rating": rating,
            "matched_phrases": matched_details,
            "urgency_count": len(matched_urgency),
            "financial_count": len(matched_financial),
            "threat_count": len(matched_threat),
            "link_count": len(urls),
            "raw_ip_links": raw_ip_urls
        }


class TimingAnalyzer:
    """
    Analyzes message Date headers to identify anomalous send-time patterns,
    such as off-hours or middle-of-the-night automated spoofing batches.
    """

    @staticmethod
    def analyze(date_header_str: str) -> dict:
        if not date_header_str:
            return {
                "parsed_date": None,
                "hour_local": None,
                "is_off_hours": False,
                "detail": "No Date header provided; timing check skipped."
            }

        try:
            dt = parsedate_to_datetime(date_header_str)
            hour = dt.hour
            # Off-hours definition: sends before 6:00 AM (< 6) or at/after 11:00 PM (>= 23)
            is_off_hours = (hour < 6 or hour >= 23)

            time_formatted = dt.strftime("%Y-%m-%d %H:%M:%S %Z")
            if is_off_hours:
                detail = f"Sent at {dt.strftime('%I:%M %p')} (local timezone hour {hour}:00), which falls in the off-hours window (23:00 - 06:00). Soft anomaly signal."
            else:
                detail = f"Sent at {dt.strftime('%I:%M %p')} (hour {hour}:00), consistent with normal daytime business operations."

            return {
                "parsed_date": time_formatted,
                "hour_local": hour,
                "is_off_hours": is_off_hours,
                "detail": detail
            }
        except Exception as e:
            return {
                "parsed_date": None,
                "hour_local": None,
                "is_off_hours": False,
                "detail": f"Could not parse Date header '{date_header_str}': {str(e)}"
            }


class SpoofDetector:
    """
    Main orchestration engine. Aggregates DNS authentication, sender domain alignment,
    content risk, and timing analysis to produce an explainable security verdict.
    """

    @classmethod
    def evaluate(cls, from_address: str, return_path: str = "", dkim_header: str = "",
                 subject: str = "", body: str = "", date_str: str = "") -> dict:
        
        # 1. Parse domains and addresses
        parser = EmailParser()
        header_data = parser.parse_headers(from_address, return_path, dkim_header)
        from_domain = header_data["from_domain"]
        return_path_domain = header_data["return_path_domain"]

        # Check alignment between From header and Return-Path (envelope sender)
        has_return_path = bool(return_path_domain)
        domains_match = (from_domain == return_path_domain) if (from_domain and return_path_domain) else True
        domain_mismatch = bool(from_domain and return_path_domain and from_domain != return_path_domain)

        # 2. Authentication validations (Real DNS lookups)
        auth_validator = AuthenticationValidator()
        spf_result = auth_validator.check_spf(from_domain)
        dkim_result = auth_validator.check_dkim(dkim_header)
        dmarc_result = auth_validator.check_dmarc(from_domain)

        # 3. Content social-engineering scan
        content_analyzer = ContentAnalyzer()
        content_result = content_analyzer.analyze(subject, body)

        # 4. Timing analysis
        timing_analyzer = TimingAnalyzer()
        timing_result = timing_analyzer.analyze(date_str)

        # 5. Rule-Based Verdict Engine
        # Calculate auth failure metrics
        auth_passes = sum([
            1 if spf_result["status"] == "PASS" else 0,
            1 if dkim_result["status"] == "PASS" else 0,
            1 if dmarc_result["status"] == "PASS" else 0
        ])
        
        auth_fails = sum([
            1 if spf_result["status"] == "FAIL" else 0,
            1 if dkim_result["status"] == "FAIL" else 0,
            1 if dmarc_result["status"] == "FAIL" else 0
        ])

        reasons = []

        if domain_mismatch:
            reasons.append(f"Domain mismatch: From header ({from_domain}) does not match Return-Path ({return_path_domain}).")

        if spf_result["status"] == "FAIL":
            reasons.append(f"SPF validation failed for {from_domain}.")
        elif spf_result["status"] == "NONE":
            reasons.append(f"No SPF record published for {from_domain}.")

        if dkim_result["status"] == "FAIL":
            reasons.append(f"DKIM verification failed: selector not found in DNS.")
        elif dkim_result["status"] == "NONE":
            reasons.append("No DKIM signature present on message.")

        if dmarc_result.get("policy") == "none_published":
            reasons.append(f"No DMARC policy on {from_domain} to enforce domain protection.")
        elif dmarc_result.get("policy") == "none":
            reasons.append(f"DMARC policy is set to 'none' (monitoring only, not enforced).")

        # Determine base verdict
        # - SPOOFED: Domain mismatch + Auth failures, or explicit FAIL on active DMARC reject domain
        # - SUSPICIOUS: Partial auth missing (no DKIM, no SPF, or soft alignment issue)
        # - LEGITIMATE: Clean domain alignment, valid SPF/DKIM/DMARC PASS
        if domain_mismatch or auth_fails >= 2 or (dmarc_result.get("policy") == "reject" and auth_passes <= 1 and auth_fails >= 1):
            base_verdict = "SPOOFED"
        elif auth_passes >= 2 and not domain_mismatch:
            base_verdict = "LEGITIMATE"
        else:
            base_verdict = "SUSPICIOUS"

        # Content Escalation Rule: A HIGH content risk score escalates (never de-escalates) verdict by one level
        final_verdict = base_verdict
        escalated = False
        if content_result["risk_rating"] == "HIGH":
            if base_verdict == "LEGITIMATE":
                final_verdict = "SUSPICIOUS"
                escalated = True
                reasons.append("Verdict escalated to SUSPICIOUS due to high-risk social engineering content triggers.")
            elif base_verdict == "SUSPICIOUS":
                final_verdict = "SPOOFED"
                escalated = True
                reasons.append("Verdict escalated to SPOOFED due to high-risk social engineering content triggers.")

        if timing_result.get("is_off_hours"):
            reasons.append("Message timestamp falls during anomalous off-hours window (23:00 - 06:00).")

        if not reasons:
            reasons.append("Authentication checks passed and sender domain alignment is verified.")

        return {
            "verdict": final_verdict,
            "base_verdict": base_verdict,
            "is_escalated": escalated,
            "sender_alignment": {
                "from_address": from_address,
                "from_domain": from_domain,
                "return_path": return_path,
                "return_path_domain": return_path_domain,
                "has_return_path": has_return_path,
                "domains_aligned": domains_match,
                "domain_mismatch": domain_mismatch
            },
            "authentication": {
                "spf": spf_result,
                "dkim": dkim_result,
                "dmarc": dmarc_result,
                "passes": auth_passes,
                "fails": auth_fails
            },
            "content_analysis": content_result,
            "timing_analysis": timing_result,
            "verdict_reasons": reasons,
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }
