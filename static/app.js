/**
 * SpoofSentry — Frontend Application Logic
 * Vanilla JavaScript client communicating with Flask REST API.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Sample Email Payloads
    // -------------------------------------------------------------
    const SAMPLE_LEGITIMATE = {
        from: 'Google Security Alerts <no-reply@accounts.google.com>',
        return_path: '<3v8lWWRQKBAgPQ-UHSOBAFFRXQWVAFFRXQ.FRP@accounts.google.com>',
        dkim_header: 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=accounts.google.com; s=20230601; t=1690000000; bh=abc1234=; h=to:from:subject:date:message-id; b=kO2q...',
        date: 'Mon, 31 Aug 2026 14:30:00 +0000',
        subject: 'Security review for your Google Account',
        body: `Hi User,

Your Google Account is operating normally. We noticed a regular sign-in from your authorized browser in California.

If this was you, no action is required. You can review your account security settings at any time.

Best regards,
Google Accounts Security Team`
    };

    const SAMPLE_SPOOFED = {
        from: 'Executive Office <executive-desk@company-internal-hq.com>',
        return_path: '<bounce-handler@attacker-relay-proxy.xyz>',
        dkim_header: '', // Missing DKIM
        date: 'Sun, 30 Aug 2026 03:15:00 +0000', // 03:15 AM -> Off-hours
        subject: 'URGENT: Immediate Wire Transfer Required - Final Notice Before Account Suspended',
        body: `Attention Finance Department,

We detected unusual activity on our vendor clearing account. Your corporate account will be suspended within 24 hours unless direct payment is confirmed immediately.

Act now to execute an urgent wire transfer to the backup bank details provided below:
Routing Number: 021000021
Direct Deposit Reference: INV-99482

Click here to confirm wire transaction: http://192.168.1.105/secure-login/bank-portal.php

Failure to comply with this final notice will result in immediate termination of services and legal action.

Regards,
Executive Leadership Team`
    };

    // -------------------------------------------------------------
    // DOM Element References
    // -------------------------------------------------------------
    const tabHeadersBtn = document.getElementById('tab-btn-headers');
    const tabEmlBtn = document.getElementById('tab-btn-eml');
    const headersTab = document.getElementById('headers-tab');
    const emlTab = document.getElementById('eml-tab');

    const form = document.getElementById('analyze-form');
    const fromInput = document.getElementById('from_address');
    const returnPathInput = document.getElementById('return_path');
    const dkimInput = document.getElementById('dkim_header');
    const dateInput = document.getElementById('date_header');
    const subjectInput = document.getElementById('subject');
    const bodyInput = document.getElementById('body');
    const btnClear = document.getElementById('btn-clear-form');

    const btnSampleLegit = document.getElementById('btn-sample-legit');
    const btnSampleSpoofed = document.getElementById('btn-sample-spoofed');

    const emlDropzone = document.getElementById('eml-dropzone');
    const emlFileInput = document.getElementById('eml-file-input');
    const emlFileInfo = document.getElementById('eml-file-info');
    const selectedFileName = document.getElementById('selected-file-name');
    const btnRemoveFile = document.getElementById('btn-remove-file');
    const btnSubmitEml = document.getElementById('btn-submit-eml');

    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const resultsContent = document.getElementById('results-content');
    const reportTimestampBadge = document.getElementById('report-timestamp-badge');

    const historyTableBody = document.getElementById('history-table-body');
    const btnRefreshHistory = document.getElementById('btn-refresh-history');

    let currentSelectedFile = null;

    // -------------------------------------------------------------
    // Tab Navigation
    // -------------------------------------------------------------
    tabHeadersBtn.addEventListener('click', () => {
        tabHeadersBtn.classList.add('active');
        tabEmlBtn.classList.remove('active');
        headersTab.classList.add('active');
        emlTab.classList.remove('active');
    });

    tabEmlBtn.addEventListener('click', () => {
        tabEmlBtn.classList.add('active');
        tabHeadersBtn.classList.remove('active');
        emlTab.classList.add('active');
        headersTab.classList.remove('active');
    });

    // -------------------------------------------------------------
    // Sample Loaders
    // -------------------------------------------------------------
    function loadSample(sample) {
        tabHeadersBtn.click();
        fromInput.value = sample.from;
        returnPathInput.value = sample.return_path;
        dkimInput.value = sample.dkim_header;
        dateInput.value = sample.date;
        subjectInput.value = sample.subject;
        bodyInput.value = sample.body;
        // Trigger auto submit for instant review
        executeHeaderAnalysis();
    }

    if (btnSampleLegit) {
        btnSampleLegit.addEventListener('click', () => loadSample(SAMPLE_LEGITIMATE));
    }
    if (btnSampleSpoofed) {
        btnSampleSpoofed.addEventListener('click', () => loadSample(SAMPLE_SPOOFED));
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            form.reset();
            hideResults();
        });
    }

    // -------------------------------------------------------------
    // EML File Drag & Drop
    // -------------------------------------------------------------
    ['dragenter', 'dragover'].forEach(eventName => {
        emlDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            emlDropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        emlDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            emlDropzone.classList.remove('dragover');
        });
    });

    emlDropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    emlFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    function handleFileSelection(file) {
        currentSelectedFile = file;
        selectedFileName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        emlFileInfo.classList.remove('hidden');
        btnSubmitEml.removeAttribute('disabled');
    }

    btnRemoveFile.addEventListener('click', () => {
        currentSelectedFile = null;
        emlFileInput.value = '';
        emlFileInfo.classList.add('hidden');
        btnSubmitEml.setAttribute('disabled', 'true');
    });

    // -------------------------------------------------------------
    // API Submissions
    // -------------------------------------------------------------
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            executeHeaderAnalysis();
        });
    }

    function showLoading() {
        emptyState.classList.add('hidden');
        resultsContent.classList.add('hidden');
        loadingState.classList.remove('hidden');
        reportTimestampBadge.innerHTML = '<span class="status-pill querying">QUERYING DNS...</span>';
    }

    function hideResults() {
        emptyState.classList.remove('hidden');
        resultsContent.classList.add('hidden');
        loadingState.classList.add('hidden');
        reportTimestampBadge.innerHTML = '<span class="status-pill idle">AWAITING INPUT</span>';
    }

    async function executeHeaderAnalysis() {
        const payload = {
            from: fromInput.value.trim(),
            return_path: returnPathInput.value.trim(),
            dkim_header: dkimInput.value.trim(),
            date: dateInput.value.trim(),
            subject: subjectInput.value.trim(),
            body: bodyInput.value.trim()
        };

        if (!payload.from) {
            alert('Please specify a From address.');
            return;
        }

        showLoading();

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to complete analysis.');
            }

            const data = await response.json();
            renderResults(data);
            fetchHistory();
        } catch (err) {
            alert('Analysis error: ' + err.message);
            hideResults();
        }
    }

    if (btnSubmitEml) {
        btnSubmitEml.addEventListener('click', async () => {
            if (!currentSelectedFile) return;

            const formData = new FormData();
            formData.append('eml_file', currentSelectedFile);

            showLoading();

            try {
                const response = await fetch('/api/analyze-eml', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to analyze .eml file.');
                }

                const data = await response.json();
                renderResults(data);
                fetchHistory();
            } catch (err) {
                alert('EML Analysis error: ' + err.message);
                hideResults();
            }
        });
    }

    // -------------------------------------------------------------
    // Render Results
    // -------------------------------------------------------------
    function renderResults(data) {
        loadingState.classList.add('hidden');
        emptyState.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        // Timestamp
        const dateObj = new Date(data.analyzed_at || Date.now());
        reportTimestampBadge.innerHTML = `<span class="status-pill live">TRIAGED AT ${dateObj.toLocaleTimeString()}</span>`;

        // 1. Verdict Banner
        const verdictBanner = document.getElementById('verdict-banner');
        const verdictText = document.getElementById('verdict-text');
        const verdictSummaryText = document.getElementById('verdict-summary-text');
        const escalationAlert = document.getElementById('escalation-alert');

        verdictBanner.className = `verdict-banner verdict-${data.verdict.toLowerCase()}`;
        verdictText.textContent = data.verdict;

        if (data.verdict === 'LEGITIMATE') {
            verdictSummaryText.textContent = 'All authentication mechanisms verified with consistent sender alignment and low content risk.';
        } else if (data.verdict === 'SUSPICIOUS') {
            verdictSummaryText.textContent = 'Partial authentication failures, weak DMARC monitoring policy, or elevated content risk indicators detected.';
        } else {
            verdictSummaryText.textContent = 'High confidence of email spoofing or active social engineering attack. Sender domain is unverified or mismatched.';
        }

        if (data.is_escalated) {
            escalationAlert.classList.remove('hidden');
        } else {
            escalationAlert.classList.add('hidden');
        }

        // 2. Sender Alignment
        const align = data.sender_alignment || {};
        document.getElementById('res-from-domain').textContent = align.from_domain || '(None)';
        document.getElementById('res-return-path-domain').textContent = align.return_path_domain || '(None)';
        
        const alignStatusEl = document.getElementById('res-alignment-status');
        if (align.domain_mismatch) {
            alignStatusEl.className = 'badge-status mismatch';
            alignStatusEl.textContent = 'MISMATCH DETECTED';
        } else {
            alignStatusEl.className = 'badge-status aligned';
            alignStatusEl.textContent = 'DOMAINS ALIGNED';
        }

        // 3. Auth Checks
        const auth = data.authentication || {};
        
        // SPF
        const spf = auth.spf || {};
        const spfTag = document.getElementById('spf-status-tag');
        spfTag.className = `status-tag ${spf.status}`;
        spfTag.textContent = spf.status;
        document.getElementById('spf-detail-text').textContent = spf.detail || '—';
        document.getElementById('spf-raw-record').textContent = spf.record || '(No SPF record published)';

        // DKIM
        const dkim = auth.dkim || {};
        const dkimTag = document.getElementById('dkim-status-tag');
        dkimTag.className = `status-tag ${dkim.status}`;
        dkimTag.textContent = dkim.status;
        document.getElementById('dkim-detail-text').textContent = dkim.detail || '—';
        document.getElementById('dkim-raw-record').textContent = dkim.record 
            ? dkim.record 
            : (dkim.selector ? `${dkim.selector}._domainkey.${dkim.domain} (No key found)` : '(No DKIM header in message)');

        // DMARC
        const dmarc = auth.dmarc || {};
        const dmarcTag = document.getElementById('dmarc-status-tag');
        dmarcTag.className = `status-tag ${dmarc.status}`;
        dmarcTag.textContent = dmarc.policy ? `p=${dmarc.policy}` : dmarc.status;
        document.getElementById('dmarc-detail-text').textContent = dmarc.detail || '—';
        document.getElementById('dmarc-raw-record').textContent = dmarc.record || `_dmarc.${align.from_domain || 'domain'} (No record)`;

        // 4. Content Risk
        const content = data.content_analysis || {};
        document.getElementById('content-risk-score').textContent = content.risk_score || 0;
        
        const riskRatingEl = document.getElementById('content-risk-rating');
        riskRatingEl.className = `risk-badge-pill ${content.risk_rating}`;
        riskRatingEl.textContent = `${content.risk_rating} RISK`;

        document.getElementById('stat-urgency').textContent = content.urgency_count || 0;
        document.getElementById('stat-financial').textContent = content.financial_count || 0;
        document.getElementById('stat-threat').textContent = content.threat_count || 0;
        document.getElementById('stat-links').textContent = content.link_count || 0;

        // Matched phrases
        const phrasesContainer = document.getElementById('matched-phrases-container');
        phrasesContainer.innerHTML = '';
        if (content.matched_phrases && content.matched_phrases.length > 0) {
            content.matched_phrases.forEach(item => {
                const badge = document.createElement('span');
                badge.className = 'phrase-badge';
                badge.innerHTML = `<span class="phrase-category">[${item.category}]</span> <strong>"${item.phrase}"</strong>`;
                phrasesContainer.appendChild(badge);
            });
        } else {
            phrasesContainer.innerHTML = '<span class="no-phrases-text">No suspicious keywords or social-engineering signals detected.</span>';
        }

        // Raw IP Alert
        const rawIpAlert = document.getElementById('raw-ip-alert');
        const rawIpList = document.getElementById('raw-ip-list');
        if (content.raw_ip_links && content.raw_ip_links.length > 0) {
            rawIpAlert.classList.remove('hidden');
            rawIpList.textContent = content.raw_ip_links.join(', ');
        } else {
            rawIpAlert.classList.add('hidden');
        }

        // 5. Timing
        const timing = data.timing_analysis || {};
        const timingBadge = document.getElementById('timing-badge');
        const timingDetail = document.getElementById('timing-detail-text');

        if (timing.is_off_hours) {
            timingBadge.className = 'timing-badge off-hours';
            timingBadge.textContent = 'OFF-HOURS ANOMALY';
        } else {
            timingBadge.className = 'timing-badge normal';
            timingBadge.textContent = 'NORMAL HOURS';
        }
        timingDetail.textContent = timing.detail || 'Normal send time window.';

        // 6. Reasons Log
        const reasonsList = document.getElementById('reasons-list');
        reasonsList.innerHTML = '';
        if (data.verdict_reasons && data.verdict_reasons.length > 0) {
            data.verdict_reasons.forEach(r => {
                const li = document.createElement('li');
                li.textContent = `• ${r}`;
                reasonsList.appendChild(li);
            });
        }
    }

    // -------------------------------------------------------------
    // History Loader
    // -------------------------------------------------------------
    async function fetchHistory() {
        if (!historyTableBody) return;

        try {
            const res = await fetch('/api/history');
            if (!res.ok) return;

            const data = await res.json();
            const rows = data.history || [];

            if (rows.length === 0) {
                historyTableBody.innerHTML = '<tr><td colspan="7" class="empty-table">No previous analyses recorded for this session.</td></tr>';
                return;
            }

            historyTableBody.innerHTML = '';
            rows.forEach(item => {
                const tr = document.createElement('tr');
                const dateStr = item.analyzed_at ? new Date(item.analyzed_at).toLocaleString() : '—';
                tr.innerHTML = `
                    <td><code>#${item.id}</code></td>
                    <td><small>${dateStr}</small></td>
                    <td><code>${escapeHtml(item.from_address)}</code></td>
                    <td>${escapeHtml(item.subject || '—')}</td>
                    <td><strong>${item.risk_score}</strong>/100</td>
                    <td><span class="badge-verdict ${item.verdict}">${item.verdict}</span></td>
                    <td><button class="btn-view-record" data-id="${item.id}">INSPECT</button></td>
                `;

                tr.querySelector('.btn-view-record').addEventListener('click', () => {
                    renderResults(item.details);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });

                historyTableBody.appendChild(tr);
            });
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }

    if (btnRefreshHistory) {
        btnRefreshHistory.addEventListener('click', fetchHistory);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initial history load
    fetchHistory();
});
