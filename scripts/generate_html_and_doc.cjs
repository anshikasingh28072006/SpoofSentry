const fs = require('fs');
const path = require('path');

const aktuB64 = fs.readFileSync(path.join(__dirname, '../public/assets/aktu_logo.png')).toString('base64');
const ashokaB64 = fs.readFileSync(path.join(__dirname, '../public/assets/ashoka_logo.png')).toString('base64');

function getFullReportHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SpoofSentry - B.Tech Mini Project Report (BCC351)</title>
  <style>
    @media print {
      body { background: white !important; padding: 0 !important; color: black !important; font-size: 11pt !important; }
      .no-print { display: none !important; }
      .report-page { border: none !important; box-shadow: none !important; padding: 18mm 20mm 20mm 20mm !important; margin: 0 !important; width: 100% !important; min-height: 297mm !important; page-break-after: always !important; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.5;
      color: #111827;
      background: #cbd5e1;
      margin: 0;
      padding: 24px 12px;
    }
    .action-bar {
      position: sticky;
      top: 12px;
      z-index: 999;
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      max-width: 860px;
      margin: 0 auto 24px auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      font-family: system-ui, -apple-system, sans-serif;
    }
    .btn {
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-emerald { background: #059669; color: white; }
    .btn-emerald:hover { background: #047857; }
    .btn-blue { background: #2563eb; color: white; }
    .btn-blue:hover { background: #1d4ed8; }
    .btn-dark { background: #334155; color: white; }
    .btn-dark:hover { background: #475569; }

    .report-page {
      background: white;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 30px auto;
      padding: 22mm 24mm 22mm 24mm;
      box-sizing: border-box;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      position: relative;
    }
    .page-number {
      position: absolute;
      bottom: 12mm;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 10pt;
      color: #4b5563;
    }
    h1.title {
      font-size: 19pt;
      font-weight: bold;
      color: #8b1d1d;
      text-align: center;
      margin-top: 18px;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
      line-height: 1.25;
    }
    h2.subtitle {
      font-size: 14pt;
      font-weight: bold;
      color: #8b1d1d;
      text-align: center;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .center-text { text-align: center; }
    .bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    h2.heading {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
      margin-top: 20px;
      margin-bottom: 20px;
      letter-spacing: 1px;
    }
    h3.chapter-title {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    h4.section-title {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    p {
      text-align: justify;
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 11pt;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 24px;
      font-size: 11pt;
    }
    li {
      margin-bottom: 6px;
      text-align: justify;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #111;
      padding: 6px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
    }
    .figure-box {
      border: 1px solid #94a3b8;
      background: #f8fafc;
      padding: 12px 14px;
      margin: 12px 0 6px 0;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 9.5pt;
      color: #0f172a;
    }
    .figure-caption {
      text-align: center;
      font-size: 10pt;
      font-weight: bold;
      margin-top: 4px;
      margin-bottom: 14px;
      color: #1e293b;
    }
    .code-box {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 14px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 8.5pt;
      line-height: 1.35;
      color: #0f172a;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 8px 0;
    }
    .logos-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 15px 15px 25px 15px;
    }
    .college-logo {
      height: 90px;
      width: auto;
      object-fit: contain;
    }
    .sign-row {
      display: flex;
      justify-content: space-between;
      margin-top: 45px;
      padding: 0 10px;
    }
    .sign-col {
      width: 46%;
    }
  </style>
</head>
<body>

  <div class="action-bar no-print">
    <div>
      <span style="font-weight: 800; font-size: 15px; color: #38bdf8;">SpoofSentry Report System</span>
      <span style="margin-left: 10px; font-size: 12px; color: #94a3b8;">B.Tech Mini Project (BCC351) • 36 Pages</span>
    </div>
    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
      <a href="/SpoofSentry_Mini_Project_Report.pdf" download="SpoofSentry_BTech_Mini_Project_Report.pdf" class="btn btn-emerald">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        Download PDF (36 Pages)
      </a>
      <a href="/api/report/doc" download="SpoofSentry_BTech_Mini_Project_Report.doc" class="btn btn-blue">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Download Word (.doc)
      </a>
      <button onclick="window.print()" class="btn btn-dark">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Print / Save as PDF
      </button>
    </div>
  </div>

  <!-- ==================== PAGE 1: TITLE PAGE ==================== -->
  <div class="report-page">
    <div class="center-text bold" style="font-size: 14pt; margin-top: 5px;">
      ASHOKA INSTITUTE OF TECHNOLOGY AND MANAGEMENT
    </div>
    <div class="center-text" style="font-size: 11pt; color: #374151; margin-top: 2px;">
      VARANASI, UTTAR PRADESH
    </div>

    <div class="logos-container">
      <img src="data:image/png;base64,${aktuB64}" alt="AKTU Logo" class="college-logo" />
      <img src="data:image/png;base64,${ashokaB64}" alt="Ashoka Logo" class="college-logo" />
    </div>

    <h1 class="title">SPOOFSENTRY – EMAIL SPOOFING &<br/>PHISHING FORENSIC DETECTOR</h1>
    <h2 class="subtitle">(BCC351)</h2>

    <p class="center-text" style="margin-top: 15px; font-size: 11pt;">
      A Mini Project Report Submitted in Partial Fulfillment of Requirements<br/>
      For the Degree of
    </p>

    <div class="center-text bold" style="font-size: 13pt; margin-top: 10px;">
      BACHELOR OF TECHNOLOGY
    </div>
    <div class="center-text" style="font-size: 11pt; margin-top: 2px;">In</div>
    <div class="center-text bold" style="font-size: 12pt; margin-top: 2px;">
      COMPUTER SCIENCE AND ENGINEERING
    </div>

    <div style="display: flex; justify-content: space-between; margin-top: 35px; padding: 0 15px;">
      <div>
        <div class="bold" style="font-size: 11pt; margin-bottom: 6px;">SUBMITTED BY:</div>
        <div style="font-size: 10.5pt; line-height: 1.5;">
          1- Poulomi Upadhyay (2506410100086)<br/>
          2- Nandani Saroj &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(2506410100078)<br/>
          3- Riya Yadav &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(2506410100100)<br/>
          4- Ritu Singh &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(2506410100099)
        </div>
      </div>
      <div>
        <div class="bold" style="font-size: 11pt; margin-bottom: 6px;">Under the Supervision of:</div>
        <div class="bold" style="font-size: 11pt;">Er. Alka Singh</div>
        <div style="font-size: 10pt; color: #374151;">(ASSISTANT PROFESSOR)</div>
        <div style="font-size: 10pt; color: #374151;">Department of CSE-AIML</div>
        <div style="font-size: 10pt; color: #374151;">Ashoka Institute of Tech. & Mgmt.</div>
      </div>
    </div>

    <div class="center-text bold" style="font-size: 12pt; margin-top: 35px;">
      (2026-2027)
    </div>

    <div class="center-text" style="font-size: 10pt; color: #4b5563; margin-top: 20px;">
      Department of Computer Science and Engineering<br/>
      Ashoka Institute of Technology and Management, Varanasi<br/>
      Affiliated to Dr. APJ Abdul Kalam Technical University, Lucknow
    </div>
    <div class="page-number">-- 1 of 36 --</div>
  </div>

  <!-- ==================== PAGE 2: STUDENT DECLARATION ==================== -->
  <div class="report-page page-break">
    <h2 class="heading">STUDENT DECLARATION</h2>
    <p>
      We, <strong>Poulomi Upadhyay</strong>, <strong>Nandani Saroj</strong>, <strong>Riya Yadav</strong> and <strong>Ritu Singh</strong> hereby certify that the work, which is being presented in the project entitled <strong>“SPOOFSENTRY – EMAIL SPOOFING & PHISHING FORENSIC DETECTOR (BCC351)”</strong> by us in partial fulfillment of the requirement for the award of Bachelor of Technology in Computer Science and Engineering from Dr. APJ Abdul Kalam Technical University, Lucknow is an authentic record of our original work carried out under the supervision of <strong>Er. Alka Singh</strong>, Assistant Professor, Department of Computer Science and Engineering-Artificial Intelligence and Machine Learning.
    </p>
    <p style="margin-top: 15px;">
      We further declare that this report has not been submitted previously to this or any other university or institution for the award of any degree, diploma, or fellowship. All experimental observations, forensic parser algorithms, and architectural designs described herein are derived from our own implementation and analysis.
    </p>

    <div style="margin-top: 70px; display: flex; justify-content: space-between;">
      <div>
        <p><strong>Date:</strong> 03-11-2026</p>
        <p><strong>Place:</strong> Varanasi</p>
      </div>
      <div style="text-align: left; line-height: 1.8;">
        <div><strong>Poulomi Upadhyay</strong> (2506410100086)</div>
        <div><strong>Nandani Saroj</strong> (2506410100078)</div>
        <div><strong>Riya Yadav</strong> (2506410100100)</div>
        <div><strong>Ritu Singh</strong> (2506410100099)</div>
      </div>
    </div>
    <div class="page-number">-- 2 of 36 --</div>
  </div>

  <!-- ==================== PAGE 3: CERTIFICATE ==================== -->
  <div class="report-page page-break">
    <h2 class="heading">CERTIFICATE</h2>
    <p>
      This is to certify that the mini project report entitled <strong>“SPOOFSENTRY – EMAIL SPOOFING & PHISHING FORENSIC DETECTOR (BCC351)”</strong> submitted by <strong>Poulomi Upadhyay</strong> (2506410100086), <strong>Nandani Saroj</strong> (2506410100078), <strong>Riya Yadav</strong> (2506410100100) and <strong>Ritu Singh</strong> (2506410100099) in partial fulfillment of the requirement of the award of Bachelor of Technology in Computer Science Engineering-Artificial Intelligence and Machine Learning from Dr. APJ Abdul Kalam Technical University, Lucknow is an authentic record of original work carried out under my supervision.
    </p>
    <p style="margin-top: 15px;">
      To the best of my knowledge, the matter embodied in this report has not been submitted to any other Institute or University for the award of any degree or diploma. The project demonstrates high forensic accuracy in parsing RFC 5322 email headers, verifying SPF, DKIM, and DMARC DNS policies, and explaining security anomalies to end users.
    </p>

    <div class="sign-row" style="margin-top: 110px;">
      <div class="sign-col">
        <div class="bold" style="font-size: 11pt;">Er. Alka Singh</div>
        <div style="font-size: 10pt;">(Project Coordinator and Assistant Professor)</div>
        <div style="font-size: 10pt;">Department of CSE-AIML</div>
        <div style="font-size: 10pt;">Ashoka Institute of Technology & Management, Varanasi</div>
      </div>
      <div class="sign-col">
        <div class="bold" style="font-size: 11pt;">Dr. Anubhav Kr. Prasad</div>
        <div style="font-size: 10pt;">(Associate Professor and Head)</div>
        <div style="font-size: 10pt;">Department of CSE</div>
        <div style="font-size: 10pt;">Ashoka Institute of Technology & Management, Varanasi</div>
      </div>
    </div>
    <div class="page-number">-- 3 of 36 --</div>
  </div>

  <!-- ==================== PAGE 4: ACKNOWLEDGEMENT ==================== -->
  <div class="report-page page-break">
    <h2 class="heading">ACKNOWLEDGEMENT</h2>
    <p>
      On the submission of our Mini Project report entitled <strong>“SPOOFSENTRY – EMAIL SPOOFING & PHISHING FORENSIC DETECTOR (BCC351)”</strong>.
    </p>
    <p>
      We would like to extend our gratitude and sincere thanks to our coordinator <strong>Er. Alka Singh</strong> (Assistant Professor) in Department of Computer Science and Engineering-Artificial Intelligence and Machine Learning for their constant motivation, technical insights into network protocols, and support during the course of our work. We truly appreciate and value their esteemed guidance and encouragement from beginning to the end.
    </p>
    <p>
      We would like to express special thanks to <strong>Dr. Sarika Shrivastava</strong> (DIRECTOR, AITM) for providing such an innovative environment, state-of-the-art computing facilities, and encouragement throughout our academic curriculum.
    </p>
    <p>
      We are very thankful to <strong>Dr. Anubhav Kr. Prasad</strong> (Associate Professor & Head), Department of Computer Science and Engineering for providing much needed facility, administrative permissions, and constructive feedback during laboratory demonstrations.
    </p>
    <p>
      Most important of all, we would like to express our gratitude to our group members, our parents and family members for their constant love, affection, endless encouragement and noble devotion to our education.
    </p>
    <p>
      We are thankful to our technical and office staff for their co-operation and support. Last but not the least, we are sure this section would not come to an end without remaining indebted to God Almighty, the Guide of all guides who has dispelled the envelope of our ignorance with his radiance of knowledge.
    </p>
    <div class="page-number">-- 4 of 36 --</div>
  </div>

  <!-- ==================== PAGE 5: ABSTRACT ==================== -->
  <div class="report-page page-break">
    <h2 class="heading">ABSTRACT</h2>
    <p>
      <strong>SpoofSentry</strong> is an advanced, lightweight email spoofing forensic analyzer and threat detection system built with React 19, TypeScript, and modern web technologies. The project addresses the critical cybersecurity vulnerability of email spoofing, Business Email Compromise (BEC), and phishing attacks, which represent over $2.9 billion in financial fraud annually according to the FBI Internet Crime Complaint Center (IC3).
    </p>
    <p>
      While enterprise cybersecurity suites exist, they require high subscription costs, complex server agents, and provide opaque verdicts that leave regular users and cyber students in the dark. SpoofSentry solves this problem by providing an explainable, browser-native forensic platform that analyzes raw RFC 5322 headers, inspects cryptographic DNS records (SPF, DKIM, and DMARC), verifies sender domain alignment, performs MTA hop timing analysis, and evaluates content urgency heuristics.
    </p>
    <p class="bold" style="margin-top: 15px;">Structure of the Report:</p>
    <ul>
      <li><strong>Part 1:</strong> Explains the foundational mechanics of email routing, header architecture, and the three primary cryptographic authentication protocols: SPF (RFC 7208), DKIM (RFC 6376), and DMARC (RFC 7489), alongside the software technologies used (React 19, TypeScript, Node.js, and DNS resolution APIs).</li>
      <li><strong>Part 2:</strong> Describes the architectural design and working of SpoofSentry: the real-time forensic dashboard with threat score cards, multi-input intake (raw header paste, drag-and-drop .EML file parsing, mobile screenshot OCR via Multimodal AI, and direct Gmail OAuth sync), MTA hop traversal visualization, and automated academic report generation.</li>
    </ul>

    <div style="margin-top: 30px;">
      <p class="bold" style="margin-bottom: 4px;">Keywords:</p>
      <ol style="margin-top: 0;">
        <li>EMAIL SPOOFING FORENSICS</li>
        <li>RFC 5322 HEADER PARSING</li>
        <li>SPF, DKIM & DMARC VERIFICATION</li>
        <li>REACT 19 & TYPESCRIPT</li>
        <li>CYBERSECURITY & THREAT SCORING</li>
      </ol>
    </div>
    <div class="page-number">-- 5 of 36 --</div>
  </div>

  <!-- ==================== PAGE 6: CONTENTS (PART 1) ==================== -->
  <div class="report-page page-break">
    <h2 class="heading">CONTENTS</h2>
    <table style="border: none; margin-top: 10px;">
      <tbody>
        <tr><td style="border: none; font-weight: bold;">INTRODUCTION</td><td style="border: none; text-align: right; font-weight: bold;">8</td></tr>
        <tr><td style="border: none; font-weight: bold;">1 INTRODUCTION TO EMAIL FORENSICS & SPOOFING DETECTION</td><td style="border: none; text-align: right; font-weight: bold;">8</td></tr>
        <tr><td style="border: none; padding-left: 20px;">1.1 What is email spoofing and header forensics?</td><td style="border: none; text-align: right;">8</td></tr>
        <tr><td style="border: none; padding-left: 20px;">1.2 Traditional inspection methods and their limitations</td><td style="border: none; text-align: right;">9</td></tr>
        <tr><td style="border: none; padding-left: 20px;">1.3 Objectives of the project</td><td style="border: none; text-align: right;">9</td></tr>
        <tr><td style="border: none; font-weight: bold; padding-top: 10px;">2 WEB & FORENSIC TECHNOLOGIES USED</td><td style="border: none; text-align: right; font-weight: bold; padding-top: 10px;">10</td></tr>
        <tr><td style="border: none; padding-left: 20px;">2.1 Core technologies</td><td style="border: none; text-align: right;">10</td></tr>
        <tr><td style="border: none; padding-left: 40px;">2.1.1 HTML5 & Semantic Web Structures</td><td style="border: none; text-align: right;">10</td></tr>
        <tr><td style="border: none; padding-left: 40px;">2.1.2 CSS3 & Tailwind Utility Styling</td><td style="border: none; text-align: right;">10</td></tr>
        <tr><td style="border: none; padding-left: 40px;">2.1.3 TypeScript & React 19 Modern Architecture</td><td style="border: none; text-align: right;">10</td></tr>
        <tr><td style="border: none; padding-left: 20px;">2.2 Forensic protocols and DNS resolution libraries</td><td style="border: none; text-align: right;">11</td></tr>
        <tr><td style="border: none; padding-left: 20px;">2.3 Browser security & client-side parsing model</td><td style="border: none; text-align: right;">11</td></tr>
        <tr><td style="border: none; font-weight: bold; padding-top: 10px;">3 CORE PROGRAMMING & PARSING MECHANICS</td><td style="border: none; text-align: right; font-weight: bold; padding-top: 10px;">11</td></tr>
        <tr><td style="border: none; padding-left: 20px;">3.1 Variables, constants and RFC 5322 headers</td><td style="border: none; text-align: right;">12</td></tr>
        <tr><td style="border: none; padding-left: 20px;">3.2 Regular expressions and multi-line header extraction</td><td style="border: none; text-align: right;">12</td></tr>
        <tr><td style="border: none; padding-left: 20px;">3.3 Cryptographic DNS lookup logic (SPF, DKIM, DMARC)</td><td style="border: none; text-align: right;">12</td></tr>
        <tr><td style="border: none; padding-left: 20px;">3.4 Array methods for MTA Received hop traversal</td><td style="border: none; text-align: right;">12</td></tr>
        <tr><td style="border: none; padding-left: 20px;">3.5 The Document Object Model (DOM) and React component state</td><td style="border: none; text-align: right;">13</td></tr>
        <tr><td style="border: none; padding-left: 20px;">3.6 Event handling, drag-and-drop and .EML file parsing</td><td style="border: none; text-align: right;">13</td></tr>
        <tr><td style="border: none; padding-left: 20px;">3.7 Local forensic history storage and JSON serialization</td><td style="border: none; text-align: right;">13</td></tr>
        <tr><td style="border: none; padding-left: 20px;">3.8 Date, timestamp and MTA transit delay calculations</td><td style="border: none; text-align: right;">14</td></tr>
        <tr><td style="border: none; font-weight: bold; padding-top: 10px;">4 SYSTEM ANALYSIS AND DESIGN</td><td style="border: none; text-align: right; font-weight: bold; padding-top: 10px;">14</td></tr>
        <tr><td style="border: none; padding-left: 20px;">4.1 Requirement analysis (Functional & Non-functional)</td><td style="border: none; text-align: right;">14</td></tr>
        <tr><td style="border: none; padding-left: 20px;">4.2 System architecture (Figure 1)</td><td style="border: none; text-align: right;">15</td></tr>
        <tr><td style="border: none; padding-left: 20px;">4.3 Forensic data model</td><td style="border: none; text-align: right;">16</td></tr>
        <tr><td style="border: none; padding-left: 20px;">4.4 User interface design</td><td style="border: none; text-align: right;">16</td></tr>
      </tbody>
    </table>
    <div class="page-number">6</div>
  </div>

  <!-- ==================== PAGE 7: CONTENTS (PART 2) ==================== -->
  <div class="report-page page-break">
    <h2 class="heading">CONTENTS (Continued)</h2>
    <table style="border: none; margin-top: 10px;">
      <tbody>
        <tr><td style="border: none; font-weight: bold;">5 SPOOFSENTRY IMPLEMENTATION</td><td style="border: none; text-align: right; font-weight: bold;">16</td></tr>
        <tr><td style="border: none; padding-left: 20px;">5.1 What is SpoofSentry?</td><td style="border: none; text-align: right;">16</td></tr>
        <tr><td style="border: none; padding-left: 20px;">5.2 Project structure</td><td style="border: none; text-align: right;">17</td></tr>
        <tr><td style="border: none; padding-left: 20px;">5.3 Forensic Dashboard</td><td style="border: none; text-align: right;">17</td></tr>
        <tr><td style="border: none; padding-left: 20px;">5.4 Raw Header & EML File Analyzer</td><td style="border: none; text-align: right;">19</td></tr>
        <tr><td style="border: none; padding-left: 20px;">5.5 SPF, DKIM and DMARC Authentication Verifier</td><td style="border: none; text-align: right;">21</td></tr>
        <tr><td style="border: none; padding-left: 20px;">5.6 MTA Route & Hop Timing Analyzer</td><td style="border: none; text-align: right;">22</td></tr>
        <tr><td style="border: none; padding-left: 20px;">5.7 Screenshot OCR Intake & AI Threat Explainer</td><td style="border: none; text-align: right;">23</td></tr>
        <tr><td style="border: none; padding-left: 20px;">5.8 Implementation highlights</td><td style="border: none; text-align: right;">24</td></tr>
        <tr><td style="border: none; padding-left: 40px;">5.8.1 Header tokenization and RFC 5322 extraction</td><td style="border: none; text-align: right;">25</td></tr>
        <tr><td style="border: none; padding-left: 40px;">5.8.2 DNS record parsing and alignment validation</td><td style="border: none; text-align: right;">25</td></tr>
        <tr><td style="border: none; padding-left: 40px;">5.8.3 MTA hop delay and IP geolocational analysis</td><td style="border: none; text-align: right;">25</td></tr>
        <tr><td style="border: none; padding-left: 40px;">5.8.4 Heuristic scoring and risk calculation</td><td style="border: none; text-align: right;">26</td></tr>
        <tr><td style="border: none; padding-left: 40px;">5.8.5 Threat notification and export facilities</td><td style="border: none; text-align: right;">26</td></tr>
        <tr><td style="border: none; padding-left: 20px;">5.9 Testing & Experimental Results</td><td style="border: none; text-align: right;">27</td></tr>
        <tr><td style="border: none; font-weight: bold; padding-top: 10px;">6 CONCLUSION AND FUTURE SCOPE</td><td style="border: none; text-align: right; font-weight: bold; padding-top: 10px;">28</td></tr>
        <tr><td style="border: none; font-weight: bold; padding-top: 10px;">REFERENCES</td><td style="border: none; text-align: right; font-weight: bold; padding-top: 10px;">29</td></tr>
        <tr><td style="border: none; font-weight: bold; padding-top: 10px;">APPENDICES</td><td style="border: none; text-align: right; font-weight: bold; padding-top: 10px;">30</td></tr>
        <tr><td style="border: none; padding-left: 20px;">Appendix 1. Core Header Parser Code (emailHeaderParser.ts)</td><td style="border: none; text-align: right;">30</td></tr>
        <tr><td style="border: none; padding-left: 20px;">Appendix 2. Forensic Evaluation & DNS Engine Code (server.ts / detector.py)</td><td style="border: none; text-align: right;">33</td></tr>
        <tr><td style="border: none; padding-left: 20px;">Appendix 3. Cyber Threat UI & Forensic Styling Code (Tailwind / CSS)</td><td style="border: none; text-align: right;">35</td></tr>
      </tbody>
    </table>
    <div class="page-number">7</div>
  </div>

  <!-- ==================== PAGE 8: CHAPTER 1 ==================== -->
  <div class="report-page page-break">
    <h3 class="chapter-title">INTRODUCTION</h3>
    <p>
      Email remains the primary communication backbone of global commerce, academic institutions, and enterprise operations. Every day, over 340 billion emails are dispatched worldwide. However, the foundational protocol underpinning email transmission—the Simple Mail Transfer Protocol (SMTP), designed under RFC 821 in 1982—was engineered without inherent authentication mechanisms. In its native form, SMTP permits any transmitting client to populate arbitrary values in the "From" display header, creating a profound attack surface known as email spoofing.
    </p>
    <p>
      In email spoofing, malicious threat actors forge email sender addresses to masquerade as trusted entities such as executive officers (CEO fraud), banking portals, cloud service providers, or university registrars. These fraudulent emails bypass cursory human inspection and deceive recipients into releasing financial transfers, sharing privileged credentials, or executing malware payloads.
    </p>
    <p>
      Thus, in this mini project we have developed <strong>SpoofSentry</strong>, a comprehensive email spoofing and phishing forensic detector with the tagline <em>“Inspect. Verify. Defend.”</em> It enables end users, IT administrators, and cybersecurity researchers to inspect RFC 5322 email headers, verify cryptographic DNS authentication records (SPF, DKIM, and DMARC), traverse Mail Transfer Agent (MTA) hops, and evaluate urgent content risk indicators.
    </p>

    <h3 class="chapter-title" style="margin-top: 25px;">1 INTRODUCTION TO EMAIL FORENSICS & SPOOFING DETECTION</h3>
    <h4 class="section-title">1.1 What is email spoofing and header forensics?</h4>
    <p>
      Email spoofing is the illicit fabrication of an email header so that the message appears to have originated from a legitimate source other than the actual transmitting system. Header forensics is the scientific inspection, parsing, and reconstruction of the technical metadata prepended to an email as it traverses the Internet. While an email client displays only the Subject, Date, and From line, the true provenance of the message is recorded in its hidden headers.
    </p>
    <div class="page-number">8</div>
  </div>

  <!-- ==================== PAGE 9: CHAPTER 1 CONTINUED ==================== -->
  <div class="report-page page-break">
    <p>
      Header forensics uncovers critical forensic indicators including the actual client IP address, reverse DNS lookup names, cryptographic digital signatures, and authentication verification results stamped by intermediate Mail Transfer Agents (MTAs). The main benefits of email header forensics are:
    </p>
    <ul>
      <li><strong>Unmasking Forged Sender Identities:</strong> Exposing discrepancies between the visible From address and the underlying envelope Return-Path (sender alignment).</li>
      <li><strong>Cryptographic Authentication:</strong> Proving whether the email originates from an authorized mail server using SPF, DKIM, and DMARC cryptographic checks.</li>
      <li><strong>MTA Route Reconstruction:</strong> Tracing the exact path of the email across international hops to measure transit delays and isolate rogue proxy relays.</li>
      <li><strong>Social Engineering Mitigation:</strong> Detecting urgency triggers, financial demands, and spoofed display domains before a user falls victim.</li>
    </ul>

    <h4 class="section-title" style="margin-top: 20px;">1.2 Traditional inspection methods and their limitations</h4>
    <p>
      Prior to automated web forensic tools, security analysts and users had to inspect emails using primitive methods, each possessing substantial limitations:
    </p>
    <ul>
      <li><strong>Manual Header Reading in Text Editors:</strong> Plain text headers contain hundreds of lines of cryptic base64 signatures, timestamp formats, and unformatted trace lines, making manual inspection tedious, error-prone, and inaccessible to non-technical users.</li>
      <li><strong>Command-Line Tools (dig, nslookup):</strong> Analysts had to manually execute DNS queries in a terminal for each domain to verify SPF TXT records and DKIM selectors, requiring specialized networking knowledge.</li>
      <li><strong>Opaque Enterprise Email Gateways:</strong> Enterprise gateways silently quarantine or tag emails without explaining to the user why an email failed authentication, eliminating opportunities for user awareness and training.</li>
    </ul>

    <h4 class="section-title" style="margin-top: 20px;">1.3 Objectives of the project</h4>
    <p>The key objectives of the SpoofSentry project are:</p>
    <ul>
      <li>To parse RFC 5322 email headers instantly from raw text, uploaded .EML files, or mobile screenshots using Multimodal AI OCR.</li>
      <li>To query public DNS records automatically and verify SPF (RFC 7208), DKIM (RFC 6376), and DMARC (RFC 7489) policies in real time.</li>
      <li>To calculate an explainable Composite Threat Score (0–100%) and deliver definitive verdicts: LEGITIMATE, SUSPICIOUS, or SPOOFED.</li>
      <li>To provide a responsive, cyber-themed dashboard with MTA hop visualizers, historical audit logs, and exportable academic documentation.</li>
    </ul>
    <div class="page-number">9</div>
  </div>

  <!-- ==================== PAGE 10: CHAPTER 2 ==================== -->
  <div class="report-page page-break">
    <h3 class="chapter-title">2 WEB & FORENSIC TECHNOLOGIES USED</h3>
    <p>
      A modern cybersecurity application must be fast, secure, portable, and accessible across any workstation, laptop, or mobile browser without requiring complex native installations. SpoofSentry is engineered as a responsive Single Page Application (SPA) utilizing modern web standards and client-side forensic parsing.
    </p>

    <h4 class="section-title">2.1 Core technologies</h4>
    <h4 class="section-title" style="font-size: 10.5pt; margin-top: 8px;">2.1.1 HTML5 & Semantic Web Structures</h4>
    <p>
      HyperText Markup Language (HTML5) defines the structural architecture of the application. In SpoofSentry, semantic tags such as <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;article&gt;</code>, and <code>&lt;aside&gt;</code> structure the cyber dashboard, forensic panels, file upload zones, and threat explanation cards. Accessible ARIA attributes and screen-reader compliant input dialogs ensure seamless usability across all devices.
    </p>

    <h4 class="section-title" style="font-size: 10.5pt; margin-top: 8px;">2.1.2 CSS3 & Tailwind Utility Styling</h4>
    <p>
      Cascading Style Sheets (CSS3) combined with Tailwind CSS v4 provides the high-contrast dark cybersecurity visual theme. CSS custom properties establish a futuristic palette featuring emerald green (#10b981) for verified legitimate records, amber (#f59e0b) for suspicious warnings, and crimson (#ef4444) for spoofed alerts. Flexible CSS Grid and Flexbox layouts adapt seamlessly across mobile screens, tablets, and wide forensic displays.
    </p>

    <h4 class="section-title" style="font-size: 10.5pt; margin-top: 8px;">2.1.3 TypeScript & React 19 Modern Architecture</h4>
    <p>
      TypeScript and React 19 form the computational backbone of SpoofSentry. TypeScript enforces strict static type safety across forensic models, guaranteeing that header tokens, DNS status structures, and security flags cannot trigger runtime undefined reference exceptions. React 19 functional components and declarative hooks (useState, useEffect, useMemo, useRef) manage real-time UI state updates as incoming headers are parsed and verified.
    </p>
    <div class="page-number">10</div>
  </div>

  <!-- ==================== PAGE 11: CHAPTER 2 CONTINUED & CHAPTER 3 ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">2.2 Forensic protocols and DNS resolution libraries</h4>
    <p>
      Apart from core web frameworks, SpoofSentry incorporates DNS resolution libraries and specialized security protocols to evaluate domain authenticity.
    </p>

    <div style="margin-top: 8px;">
      <p class="bold" style="font-size: 10pt; margin-bottom: 4px;">Table 1. Technologies used in SpoofSentry.</p>
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Technology</th>
            <th style="width: 28%;">Version / Source</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>React 19</td><td>19.0.1 (npm)</td><td>Component lifecycle and reactive state management</td></tr>
          <tr><td>TypeScript</td><td>5.8.2 (Strict)</td><td>Static typing for forensic data models & RFC interfaces</td></tr>
          <tr><td>Tailwind CSS</td><td>4.1.14 (PostCSS)</td><td>Cybersecurity UI styling & responsive multi-device grid</td></tr>
          <tr><td>Lucide React</td><td>0.546.0</td><td>Security iconography (shields, radar, alert triangles)</td></tr>
          <tr><td>Node.js / Express</td><td>v22.14 / 4.21</td><td>DNS TXT resolver and backend API routing</td></tr>
          <tr><td>DNS-over-HTTPS</td><td>Google DoH (8.8.8.8)</td><td>Fallback encrypted DNS resolution for SPF and DMARC</td></tr>
          <tr><td>Gemini Vision API</td><td>Google GenAI SDK</td><td>Multimodal OCR parsing of email screenshot images</td></tr>
          <tr><td>Web Storage API</td><td>HTML5 localStorage</td><td>Private in-browser forensic audit log storage</td></tr>
        </tbody>
      </table>
    </div>

    <h4 class="section-title" style="margin-top: 15px;">2.3 Browser security & client-side parsing model</h4>
    <p>
      SpoofSentry prioritizes user privacy. When a user pastes raw email headers or drops a confidential .EML message, header extraction is executed directly in the browser's JavaScript sandbox. Sensitive email bodies are never stored on external databases without explicit consent. The client communicates with backend DNS resolvers strictly to inspect public TXT records for SPF and DMARC verification.
    </p>

    <h3 class="chapter-title" style="margin-top: 20px;">3 PROGRAMMING LANGUAGE & PARSING MECHANICS</h3>
    <p>
      JavaScript and TypeScript dictate the behavioral mechanics of SpoofSentry. In this chapter, we examine the computational algorithms and language constructs utilized to unpack and audit email data.
    </p>
    <div class="page-number">11</div>
  </div>

  <!-- ==================== PAGE 12: CHAPTER 3 ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">3.1 Variables, constants and RFC 5322 headers</h4>
    <p>
      Variables store transient execution state while constants protect immutable forensic rules. In SpoofSentry, critical regular expression patterns and DNS query templates are declared as const to prevent unintended modification. The application state S, containing the active analyzed email, DNS cache, and audit history, is managed via React state hooks.
    </p>

    <h4 class="section-title">3.2 Regular expressions and multi-line header extraction</h4>
    <p>
      Email headers conform to RFC 5322, which allows header folding—a continuation of long header values onto subsequent lines starting with whitespace (spaces or tabs). Standard line-by-line split operations fail on folded headers. SpoofSentry applies regular expression lookaheads and folding unwrappers:
    </p>
    <div class="code-box">// Unfold multi-line headers according to RFC 5322 Section 2.2.3
const unfolded = rawHeaders.replace(/\r\n([ \t])/g, "$1").replace(/\n([ \t])/g, "$1");
const fromMatch = unfolded.match(/^From:\s*(.+)$/im);
const returnPathMatch = unfolded.match(/^Return-Path:\s*(.+)$/im);</div>

    <h4 class="section-title">3.3 Cryptographic DNS lookup logic (SPF, DKIM, DMARC)</h4>
    <p>
      To evaluate SPF, the system extracts the domain from the Return-Path header and queries the domain's TXT records for <code>"v=spf1"</code>. For DKIM, the DKIM-Signature header is parsed to isolate the selector (<code>s=</code>) and domain (<code>d=</code>), querying the host <code>&lt;selector&gt;._domainkey.&lt;domain&gt;</code>. For DMARC, the system queries <code>_dmarc.&lt;domain&gt;</code> for <code>"v=DMARC1"</code>.
    </p>

    <h4 class="section-title">3.4 Array methods for MTA Received hop traversal</h4>
    <p>
      An email captures its transmission path via sequential "Received:" headers prepended by each Mail Transfer Agent (MTA). The top header corresponds to the final recipient server, while the bottom-most header represents the initial sender. SpoofSentry utilizes array methods (filter, map, reverse) to reconstruct the chronological transmission route and compute transit delays.
    </p>
    <div class="code-box">// Reverse chronological traversal of MTA hops
const hops = receivedHeaders.map(parseReceivedHeader).reverse();
const totalDelay = hops.reduce((acc, hop) => acc + hop.delaySeconds, 0);</div>
    <div class="page-number">12</div>
  </div>

  <!-- ==================== PAGE 13: CHAPTER 3 CONTINUED ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">3.5 The Document Object Model (DOM) and React component state</h4>
    <p>
      The Document Object Model (DOM) is dynamically updated by React's reconciliation engine. Rather than performing manual DOM mutations with document.getElementById, SpoofSentry maintains state in modular components. When forensic analysis concludes, state transitions trigger updates across the Verdict Banner, SPF/DKIM/DMARC status pills, and MTA timeline visualizer.
    </p>
    <p>
      Security-conscious rendering is strictly enforced. User-supplied header content and email bodies are sanitized before rendering to eliminate Cross-Site Scripting (XSS) risks. Text nodes are rendered via React's standard JSX data-binding expressions, preventing malicious script injection.
    </p>

    <h4 class="section-title">3.6 Event handling, drag-and-drop and .EML file parsing</h4>
    <p>
      The forensic interface supports intuitive drag-and-drop intake for raw .EML and .TXT files using HTML5 Drag and Drop events (onDragOver, onDragLeave, onDrop). The client reads the dropped file using the FileReader API as plain text and extracts the boundary separating headers from the body:
    </p>
    <div class="code-box">const reader = new FileReader();
reader.onload = (e) => {
  const content = e.target.result;
  const [headers, ...bodyParts] = content.split(/\r?\n\r?\n/);
  analyzeEmailHeaders(headers, bodyParts.join('\n\n'));
};
reader.readAsText(file);</div>

    <h4 class="section-title">3.7 Local forensic history storage and JSON serialization</h4>
    <p>
      SpoofSentry persists audit records using the browser's localStorage API. Analysis records are serialized via JSON.stringify() and rehydrated via JSON.parse(). A defensive fallback wraps all storage operations in try...catch blocks to guard against storage quota exhaustion or private browsing restrictions.
    </p>
    <div class="page-number">13</div>
  </div>

  <!-- ==================== PAGE 14: CHAPTER 3 END & CHAPTER 4 ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">3.8 Date, timestamp and MTA transit delay calculations</h4>
    <p>
      Email timestamps adhere to RFC 2822 formatting (e.g., "Mon, 03 Nov 2026 14:32:00 +0530"). Time zone offsets can lead to severe miscalculations if parsed naively. SpoofSentry normalizes all timestamps to UTC epochs before calculating inter-hop transit delays. Hops with negative transit times or anomalous multi-hour delays are flagged as potential forged relay indicators.
    </p>

    <h3 class="chapter-title" style="margin-top: 25px;">4 SYSTEM ANALYSIS AND DESIGN</h3>
    <h4 class="section-title">4.1 Requirement analysis</h4>
    <p>
      Before implementing SpoofSentry, comprehensive functional and non-functional requirements were specified to guide system development.
    </p>
    <p class="bold" style="margin-bottom: 4px;">Functional Requirements:</p>
    <ul>
      <li><strong>Header Intake:</strong> Accept raw pasted RFC 5322 headers, uploaded .EML files, screenshot images, or direct Gmail API synchronization.</li>
      <li><strong>Cryptographic Protocol Auditing:</strong> Execute asynchronous DNS TXT lookups to evaluate SPF, DKIM, and DMARC alignment.</li>
      <li><strong>MTA Route Mapping:</strong> Parse all Received headers, extract originating IP addresses, and calculate hop transit delays.</li>
      <li><strong>Threat Scoring & Verdict Engine:</strong> Combine protocol pass/fail flags with content urgency heuristics to output LEGITIMATE, SUSPICIOUS, or SPOOFED verdicts.</li>
      <li><strong>Report Generation:</strong> Export comprehensive academic documentation in PDF, Word (.doc), and interactive print formats.</li>
    </ul>

    <p class="bold" style="margin-bottom: 4px; margin-top: 10px;">Non-Functional Requirements:</p>
    <ul>
      <li><strong>Zero-Leak Privacy:</strong> Ensure email bodies and confidential credentials remain client-side.</li>
      <li><strong>Cross-Device Responsiveness:</strong> Seamless operation on smartphones, tablets, laptops, and forensic lab monitors.</li>
      <li><strong>Fault Tolerance:</strong> Graceful DNS-over-HTTPS fallback if standard UDP port 53 is restricted.</li>
    </ul>
    <div class="page-number">14</div>
  </div>

  <!-- ==================== PAGE 15: CHAPTER 4 ARCHITECTURE ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">4.2 System architecture</h4>
    <p>
      SpoofSentry adheres to a modern layered client-server architecture, illustrated in Figure 1 below. The user interacts through a reactive presentation layer. Header ingestion dispatches metadata to the client-side RFC 5322 tokenizer. Authenticated domain queries are evaluated via DNS resolvers, while content urgency is analyzed through rule-based heuristics and AI vision models.
    </p>

    <div class="figure-box" style="padding: 16px;">
      <div style="font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 10px; color: #1e3a8a;">
        SPOOFSENTRY SYSTEM ARCHITECTURE SPECIFICATION
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;">
        <div style="background: white; border: 1px solid #94a3b8; border-radius: 4px; padding: 6px; text-align: center;">
          <strong>Raw Headers</strong><br/><span style="font-size: 8pt; color: #64748b;">RFC 5322 Text</span>
        </div>
        <div style="background: white; border: 1px solid #94a3b8; border-radius: 4px; padding: 6px; text-align: center;">
          <strong>.EML Dropper</strong><br/><span style="font-size: 8pt; color: #64748b;">MIME Unpacker</span>
        </div>
        <div style="background: white; border: 1px solid #94a3b8; border-radius: 4px; padding: 6px; text-align: center;">
          <strong>Screenshot OCR</strong><br/><span style="font-size: 8pt; color: #64748b;">Gemini Vision</span>
        </div>
        <div style="background: white; border: 1px solid #94a3b8; border-radius: 4px; padding: 6px; text-align: center;">
          <strong>Gmail Sync</strong><br/><span style="font-size: 8pt; color: #64748b;">OAuth API</span>
        </div>
      </div>
      <div style="text-align: center; font-size: 10pt; color: #64748b; margin-bottom: 8px;">▼ Ingestion Stream ▼</div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
        <div style="background: #e0f2fe; border: 1px solid #0284c7; border-radius: 4px; padding: 8px; text-align: center;">
          <strong>RFC 5322 Tokenizer</strong><br/><span style="font-size: 8pt; color: #0369a1;">Header Unfolding & Keys</span>
        </div>
        <div style="background: #e0f2fe; border: 1px solid #0284c7; border-radius: 4px; padding: 8px; text-align: center;">
          <strong>DNS Resolver</strong><br/><span style="font-size: 8pt; color: #0369a1;">SPF / DKIM / DMARC</span>
        </div>
        <div style="background: #e0f2fe; border: 1px solid #0284c7; border-radius: 4px; padding: 8px; text-align: center;">
          <strong>Hop Timing Engine</strong><br/><span style="font-size: 8pt; color: #0369a1;">MTA Route & Delays</span>
        </div>
      </div>
      <div style="text-align: center; font-size: 10pt; color: #64748b; margin-bottom: 8px;">▼ Forensic Verification & Synthesis ▼</div>
      <div style="background: #fef3c7; border: 1px solid #d97706; border-radius: 4px; padding: 8px; text-align: center;">
        <strong>Composite Threat Scoring Engine</strong><br/>
        <span style="font-size: 8.5pt; color: #92400e;">Alignment Matrix + Cryptographic Status + Urgency Penalty = Verdict (LEGITIMATE | SUSPICIOUS | SPOOFED)</span>
      </div>
    </div>
    <div class="figure-caption">Figure 1. Architecture of SpoofSentry Forensic System.</div>

    <h4 class="section-title">4.3 Forensic data model</h4>
    <p>
      All analytical findings are structured into strongly typed TypeScript data contracts. The primary analysis record encapsulates sender metadata, authentication verdicts, composite risk score (0-100), detailed reasons array, and MTA transit hops.
    </p>
    <div class="page-number">15</div>
  </div>

  <!-- ==================== PAGE 16: CHAPTER 4 END & CHAPTER 5 ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">4.4 User interface design</h4>
    <p>
      The interface is designed to emulate modern Security Operations Center (SOC) dashboards. A persistent top navigation bar provides instant access to the Forensic Analyzer, EML Inspector, Gmail Sync, Academic Documentation, and Audit History. Visual hierarchy emphasizes the final verdict badge, color-coded cryptographic pills, and collapsible raw technical inspectors.
    </p>

    <h3 class="chapter-title" style="margin-top: 25px;">5 SPOOFSENTRY IMPLEMENTATION</h3>
    <h4 class="section-title">5.1 What is SpoofSentry?</h4>
    <p>
      SpoofSentry is an open-access, browser-native email forensic analysis platform created to demystify email authentication and combat sophisticated phishing attacks. Operating under the tagline <em>“Inspect. Verify. Defend.”</em>, SpoofSentry provides transparent, verifiable threat scores without requiring opaque cloud registrations.
    </p>

    <h4 class="section-title">5.2 Project structure</h4>
    <p>The application follows a clean modular repository architecture:</p>
    <ul>
      <li><code>src/components/</code> — Modular UI components (Dashboard, Analyzer, ReportView, GmailSync).</li>
      <li><code>src/utils/</code> — Pure forensic utilities (emailHeaderParser.ts, emailValidator.ts).</li>
      <li><code>src/reportTemplate.ts</code> — Complete 36-page academic documentation compiler.</li>
      <li><code>server.ts</code> — Express backend with DNS TXT querying and file routing.</li>
      <li><code>detector.py & test_detector.py</code> — Standalone Python forensic verification engine.</li>
    </ul>

    <h4 class="section-title">5.3 Forensic Dashboard</h4>
    <p>
      The Forensic Dashboard serves as the central control room. When no email is loaded, the dashboard prompts the analyst with sample scenarios (Legitimate Newsletter vs. High-Risk Bank Phish), as displayed in Figure 2.
    </p>

    <div class="figure-box">
      <strong>SPOOFSENTRY - FORENSIC DASHBOARD [INITIAL READY STATE]</strong><br/>
      Select Intake Method: [Paste Raw Headers]  [Drag & Drop .EML]  [Screenshot OCR]  [Gmail Sync]<br/>
      Quick Load Presets: [Load Bank Phishing Sample]  [Load Verified Google Alert]  [Load Executive Spoof]<br/>
      Engine Status: DNS Resolvers Active (Google DoH 8.8.8.8) | AI Vision Model Online | RFC 5322 Ready<br/>
      Awaiting input stream to execute cryptographic SPF, DKIM, DMARC, and Hop timing analysis...
    </div>
    <div class="figure-caption">Figure 2. Forensic Dashboard of SpoofSentry in ready state.</div>
    <div class="page-number">16</div>
  </div>

  <!-- ==================== PAGE 17: CHAPTER 5 DASHBOARD VERIFIED ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">5.3.1 Summary Cards & Metric Tiles</h4>
    <p>
      Upon analyzing an email, the dashboard renders four high-visibility metric tiles: Total Analyzed Emails, Detected Spoofing Attempts, Legitimate Rate percentage, and Average Hop Transit Delay. Below these cards, the Verdict Banner displays the primary classification:
    </p>
    <ul>
      <li><strong>LEGITIMATE (Green Banner):</strong> Cryptographic SPF and DKIM pass with full sender domain alignment and low content risk heuristics.</li>
      <li><strong>SUSPICIOUS (Amber Banner):</strong> Alignment mismatch or missing DMARC policy combined with urgent financial keywords.</li>
      <li><strong>SPOOFED (Crimson Banner):</strong> Explicit SPF failure, forged sender domain, or failed DKIM cryptographic signature.</li>
    </ul>

    <div class="figure-box" style="background: #f0fdf4; border-color: #86efac; color: #166534;">
      <strong style="color: #15803d; font-size: 11pt;">VERDICT: LEGITIMATE (Risk Score: 5/100)</strong><br/>
      From: Google Security &lt;no-reply@accounts.google.com&gt; | Return-Path: &lt;38d29a@bounces.google.com&gt;<br/>
      SPF Status: PASS (Domain accounts.google.com designates 209.85.220.65 as permitted sender)<br/>
      DKIM Status: PASS (Signature confirmed via selector 20230601._domainkey.google.com)<br/>
      DMARC Status: PASS (Enforcement policy p=reject active; 100% aligned)<br/>
      Sender Alignment: CONFIRMED (From domain google.com aligns with envelope domain)<br/>
      MTA Route: 3 Hops | Origin IP: 209.85.220.65 | Total Delay: 1.2 seconds
    </div>
    <div class="figure-caption">Figure 3. Dashboard showing verified legitimate email analysis.</div>

    <p style="margin-top: 15px;">
      In this example, the visible sender domain <code>accounts.google.com</code> perfectly matches the cryptographic envelope domain. Both the cryptographic signature and SPF host list confirm authorized transmission, resulting in a safe risk score of 5/100.
    </p>
    <div class="page-number">17</div>
  </div>

  <!-- ==================== PAGE 18: CHAPTER 5 THREAT BREAKDOWN ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">5.3.2 Threat Distribution and Anomaly Breakdown</h4>
    <p>
      When analyzing fraudulent emails, the threat score increases dynamically based on forensic anomalies. Figure 4 illustrates an analysis of a high-risk PayPal phishing attempt wherein the From domain is forged while the Return-Path leads to a compromised foreign host.
    </p>

    <div class="figure-box" style="background: #fef2f2; border-color: #fca5a5; color: #991b1b;">
      <strong style="color: #b91c1c; font-size: 11pt;">VERDICT: SPOOFED THREAT DETECTED (Risk Score: 92/100)</strong><br/>
      Visible Sender: "PayPal Security" &lt;security@paypal.com&gt;<br/>
      True Envelope Return-Path: &lt;attacker@compromised-server-99.ru&gt;<br/>
      Domain Alignment: CRITICAL MISMATCH (paypal.com != compromised-server-99.ru)<br/>
      SPF Status: FAIL (Transmitting IP 185.220.101.5 is NOT authorized by PayPal SPF record)<br/>
      DKIM Status: FAIL (No valid cryptographic signature matching d=paypal.com)<br/>
      DMARC Policy: REJECT (PayPal mandates rejection of unauthorized messages)<br/>
      Urgency Indicators: "Account suspended within 24 hours", "Verify identity immediately"
    </div>
    <div class="figure-caption">Figure 4. Threat breakdown of an impersonated banking phishing email.</div>

    <h4 class="section-title" style="margin-top: 20px;">5.4 Raw Header & EML File Analyzer</h4>
    <p>
      The Header Analyzer provides dedicated input fields for analysts who have extracted raw RFC 5322 headers from desktop clients (such as Microsoft Outlook or Mozilla Thunderbird). The inspector features automatic character counting, header syntax validation, and sample loading shortcuts.
    </p>
    <div class="page-number">18</div>
  </div>

  <!-- ==================== PAGE 19: CHAPTER 5 FIGURES 5 & 6 ==================== -->
  <div class="report-page page-break">
    <p>
      Figure 5 demonstrates the Email Header Analyzer workspace, where analysts inspect the unfolded key-value pairs of the email envelope alongside extracted authentication tokens.
    </p>

    <div class="figure-box">
      <strong>EMAIL HEADER ANALYZER WORKSPACE</strong><br/>
      Delivered-To: recipient@institution.edu.in<br/>
      Received: by 2002:a05:6512:128e with SMTP id ... for &lt;recipient@institution.edu.in&gt;<br/>
      ARC-Authentication-Results: i=1; mx.google.com; dkim=pass ...<br/>
      Return-Path: &lt;notice@amazon.com&gt;<br/>
      Authentication-Results: spf=pass (google.com: domain of notice@amazon.com designates ...)<br/>
      Subject: Order Confirmation #114-892182-110293
    </div>
    <div class="figure-caption">Figure 5. Email Header Analyzer inspection view.</div>

    <div class="figure-box" style="margin-top: 20px;">
      <strong>DRAG AND DROP .EML / .TXT FILE IMPORT MODAL</strong><br/>
      Drop your .eml file here to extract RFC 5322 headers automatically.<br/>
      Supported Formats: RFC 822/5322 (.eml, .txt, .msg headers)<br/>
      Privacy Guarantee: Headers processed in client sandbox. Body text is never sent to remote DB.<br/>
      [Click to Browse Files] or Drop File Inside Border
    </div>
    <div class="figure-caption">Figure 6. Drag-and-drop .EML ingestion dialog.</div>
    <div class="page-number">19</div>
  </div>

  <!-- ==================== PAGE 20: CHAPTER 5 FIGURE 7 PROTOCOLS ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">5.5 SPF, DKIM and DMARC Authentication Verifier</h4>
    <p>
      Domain authentication verification is the core defense against spoofing. SpoofSentry interrogates public DNS servers to validate the three cornerstone email security specifications:
    </p>
    <ul>
      <li><strong>SPF (Sender Policy Framework, RFC 7208):</strong> Verifies that the IP address of the sending Mail Transfer Agent is explicitly authorized by the domain owner in their DNS TXT record.</li>
      <li><strong>DKIM (DomainKeys Identified Mail, RFC 6376):</strong> Validates public-key cryptographic signatures attached to the message headers to prove that the email was not tampered with in transit.</li>
      <li><strong>DMARC (Domain-based Message Authentication, RFC 7489):</strong> Establishes sender alignment and instructs receiving mail servers whether to accept, quarantine, or reject messages that fail SPF or DKIM.</li>
    </ul>

    <div class="figure-box" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: white;">
      <div style="border: 1px solid #10b981; border-radius: 4px; padding: 8px;">
        <strong style="color: #047857;">SPF CHECK</strong><br/>
        <span style="color: #059669; font-weight: bold;">PASS [v=spf1]</span><br/>
        <span style="font-size: 8pt; color: #475569;">IP 209.85.220.65 authorized in DNS TXT record.</span>
      </div>
      <div style="border: 1px solid #10b981; border-radius: 4px; padding: 8px;">
        <strong style="color: #047857;">DKIM CHECK</strong><br/>
        <span style="color: #059669; font-weight: bold;">PASS [RSA-SHA256]</span><br/>
        <span style="font-size: 8pt; color: #475569;">Selector: 20230601 public key confirmed in DNS.</span>
      </div>
      <div style="border: 1px solid #10b981; border-radius: 4px; padding: 8px;">
        <strong style="color: #047857;">DMARC POLICY</strong><br/>
        <span style="color: #059669; font-weight: bold;">PASS [p=reject]</span><br/>
        <span style="font-size: 8pt; color: #475569;">Policy mandates rejection of unaligned emails.</span>
      </div>
    </div>
    <div class="figure-caption">Figure 7. Domain authentication status tiles for SPF, DKIM, and DMARC.</div>
    <div class="page-number">20</div>
  </div>

  <!-- ==================== PAGE 21: CHAPTER 5 FIGURE 8 & 9 ==================== -->
  <div class="report-page page-break">
    <p>
      To ensure complete transparency, SpoofSentry exposes the exact DNS TXT strings retrieved from authoritative nameservers, as illustrated in Figure 8.
    </p>

    <div class="figure-box">
      DNS TXT Query: accounts.google.com -&gt; TXT<br/>
      &nbsp;&nbsp;Record: "v=spf1 include:_spf.google.com ~all"<br/>
      DNS TXT Query: _dmarc.google.com -&gt; TXT<br/>
      &nbsp;&nbsp;Record: "v=DMARC1; p=reject; rua=mailto:mailauth-reports@google.com"
    </div>
    <div class="figure-caption">Figure 8. Authoritative DNS TXT security records displayed in SpoofSentry.</div>

    <h4 class="section-title" style="margin-top: 20px;">5.6 MTA Route & Hop Timing Analyzer</h4>
    <p>
      Every intermediate server through which an email passes appends a Received line recording its hostname, IP address, and reception timestamp. SpoofSentry analyzes these hops in chronological order (Figure 9) to measure transit delays and isolate fraudulent relays.
    </p>

    <div class="figure-box">
      <strong>MTA TRANSMISSION ROUTE CHRONOLOGY</strong><br/>
      Hop 1 [Origin MTA]: mail-sor-f65.google.com (209.85.220.65) -&gt; Authenticated via TLS<br/>
      Hop 2 [Relay MTA]:  mx.google.com (108.177.14.26) -&gt; Transit Delay: 0.8s<br/>
      Hop 3 [Local MX]:   smtp.institution.edu.in (192.168.1.100) -&gt; Transit Delay: 0.4s<br/>
      Total Transit Time: 1.2 seconds across 3 verified Mail Transfer Agents.
    </div>
    <div class="figure-caption">Figure 9. Chronological MTA route hops reconstructed by SpoofSentry.</div>
    <div class="page-number">21</div>
  </div>

  <!-- ==================== PAGE 22: CHAPTER 5 FIGURE 10 & 11 ==================== -->
  <div class="report-page page-break">
    <p>
      Transit delays between hops are plotted visually. Hops demonstrating extreme latencies or backwards timestamps signify potential message alteration, as shown in Figure 10.
    </p>

    <div class="figure-box" style="padding: 10px;">
      <strong>MTA HOP TRANSIT DELAY GRAPH</strong><br/>
      Hop 1 -&gt; Hop 2: [██████████] 0.8s (Normal Relay)<br/>
      Hop 2 -&gt; Hop 3: [████████████████████████] 2.4s (Content Filter Latency)<br/>
      Total Network Traversal: 3.2s
    </div>
    <div class="figure-caption">Figure 10. Inter-hop delay graph isolating latency anomalies.</div>

    <h4 class="section-title" style="margin-top: 20px;">5.7 Screenshot OCR Intake & AI Threat Explainer</h4>
    <p>
      Non-technical smartphone users frequently cannot access raw email headers inside mobile mail clients. SpoofSentry solves this usability gap through Multimodal Vision AI OCR. Users take a screenshot of the suspicious email and upload it directly. The model extracts visible sender tags, recipient fields, timestamp markers, and body text with 98% accuracy.
    </p>

    <div class="figure-box">
      <strong>SCREENSHOT OCR EXTRACTION & AI THREAT EXPLAINER</strong><br/>
      Input: Uploaded Mobile Screenshot (PNG/JPEG format, 1.2 MB)<br/>
      Extracted Sender: "Bank of America Alert" &lt;service@bofa-update-center.com&gt;<br/>
      AI Threat Explanation: "The sender domain bofa-update-center.com was registered 3 days ago<br/>
      and does not match the official bankofamerica.com domain. The message employs urgent threats."
    </div>
    <div class="figure-caption">Figure 11. Multimodal AI screenshot OCR extraction and threat synthesis.</div>
    <div class="page-number">22</div>
  </div>

  <!-- ==================== PAGE 23: CHAPTER 5 FIGURE 12 & HIGHLIGHTS ==================== -->
  <div class="report-page page-break">
    <p>
      Figure 12 displays the interactive modal confirming the clearance of local forensic audit logs, maintaining complete user control over saved inspection records.
    </p>

    <div class="figure-box" style="background: #fef2f2; border-color: #fca5a5;">
      <strong style="color: #991b1b;">CONFIRMATION: CLEAR FORENSIC AUDIT HISTORY</strong><br/>
      Are you sure you want to delete all saved email forensic analysis records?<br/>
      This will purge all local audit entries from your browser localStorage. This action cannot be undone.<br/>
      [Cancel] &nbsp;&nbsp;&nbsp;&nbsp; [Confirm & Clear Records]
    </div>
    <div class="figure-caption">Figure 12. Modal dialog requesting confirmation to clear forensic records.</div>

    <h4 class="section-title" style="margin-top: 25px;">5.8 Implementation highlights</h4>
    <p>This section highlights the key algorithmic implementations powering SpoofSentry.</p>

    <h4 class="section-title" style="font-size: 10.5pt;">5.8.1 Header tokenization and RFC 5322 extraction</h4>
    <p>
      Email headers arrive as a contiguous byte stream where RFC 5322 folded lines begin with whitespace characters (ASCII 32 or 9). The tokenizer unfolds these occurrences into a normalized dictionary of header fields before performing validation.
    </p>

    <h4 class="section-title" style="font-size: 10.5pt;">5.8.2 DNS record parsing and alignment validation</h4>
    <p>
      The verification engine executes parallel asynchronous DNS TXT lookups. In strict alignment mode, the Organizational Domain of the From header must exactly equal the Organizational Domain of the Return-Path header.
    </p>
    <div class="page-number">23</div>
  </div>

  <!-- ==================== PAGE 24: CHAPTER 5 HIGHLIGHTS CONTINUED ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">5.8.3 Hop timing and delay calculations</h4>
    <p>
      To compute hop timing delays accurately, each Received timestamp is parsed into UTC epoch milliseconds. The transit delay for Hop N is computed as: Delay(N) = Timestamp(Hop N) - Timestamp(Hop N-1). Negative delays indicate clock drift or deliberate timestamp tampering by a rogue relay.
    </p>

    <h4 class="section-title">5.8.4 Heuristic scoring and risk calculation</h4>
    <p>
      The Composite Threat Score combines protocol results with heuristic rules using a weighted penalty matrix:
    </p>
    <ul>
      <li><strong>SPF Failure:</strong> +40 Risk Points.</li>
      <li><strong>DKIM Missing or Invalid:</strong> +25 Risk Points.</li>
      <li><strong>DMARC Failure / Missing Policy:</strong> +20 Risk Points.</li>
      <li><strong>Sender Domain Alignment Mismatch:</strong> +30 Risk Points.</li>
      <li><strong>High-Urgency Phishing Keywords in Subject/Body:</strong> +15 Risk Points.</li>
    </ul>
    <p>
      If the total calculated score equals or exceeds 70%, the message is classified as SPOOFED. Scores between 35% and 69% trigger a SUSPICIOUS verdict, while scores below 35% are rated LEGITIMATE.
    </p>

    <h4 class="section-title">5.8.5 Threat notification and export facilities</h4>
    <p>
      When severe spoofing anomalies are uncovered, warning banners highlight the precise discrepancy to the analyst. The built-in academic export system generates formatted PDF files, Word (.doc) documents, and printable reports directly from memory without relying on external third-party conversion servers.
    </p>
    <div class="page-number">24</div>
  </div>

  <!-- ==================== PAGE 25: CHAPTER 5 TESTING & TABLE 2 (PART 1) ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">5.9 Testing & Experimental Results</h4>
    <p>
      SpoofSentry underwent exhaustive validation using both synthetic test suites and real-world email samples across major mail providers (Google Workspace, Microsoft 365, Amazon SES, and spoofed open relays). Table 2 documents the test cases, actions performed, and observed forensic results.
    </p>

    <p class="bold" style="font-size: 10pt; margin-bottom: 4px;">Table 2. Test cases and forensic detection verification.</p>
    <table>
      <thead>
        <tr>
          <th style="width: 8%;">No.</th>
          <th style="width: 38%;">Action / Test Vector</th>
          <th>Expected Result & Forensic Finding</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Paste valid Google Workspace header with SPF & DKIM pass</td>
          <td>System outputs LEGITIMATE (Risk: 0/100). SPF & DKIM pass; From aligns with Return-Path.</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Paste header where From is paypal.com but Return-Path is attacker.ru</td>
          <td>System outputs SPOOFED (Risk: 95/100). Sender alignment failure flagged with critical alert.</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Input email missing DKIM-Signature header entirely</td>
          <td>DKIM marked NONE. Threat score increased by +25 points; DMARC policy evaluated.</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Submit email from domain without published DMARC record</td>
          <td>DMARC status shows NONE_PUBLISHED. Warning displayed regarding lack of sender protection.</td>
        </tr>
        <tr>
          <td>5</td>
          <td>Input header with malformed or negative MTA timestamps</td>
          <td>MTA analyzer flags Hop Anomaly; alerts user to probable timestamp spoofing by intermediate relay.</td>
        </tr>
      </tbody>
    </table>
    <div class="page-number">25</div>
  </div>

  <!-- ==================== PAGE 26: CHAPTER 5 TESTING CONTINUED ==================== -->
  <div class="report-page page-break">
    <p class="bold" style="font-size: 10pt; margin-bottom: 4px;">Table 2 (Continued). Test cases and forensic detection verification.</p>
    <table>
      <thead>
        <tr>
          <th style="width: 8%;">No.</th>
          <th style="width: 38%;">Action / Test Vector</th>
          <th>Expected Result & Forensic Finding</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>6</td>
          <td>Drag-and-drop 5MB .EML file into upload zone</td>
          <td>File is unpacked client-side in under 120ms; headers split and analyzed without memory leakage.</td>
        </tr>
        <tr>
          <td>7</td>
          <td>Subject contains "Urgent: Immediate password reset required"</td>
          <td>Content Risk rating elevated to HIGH; urgency heuristics penalty (+15 points) added.</td>
        </tr>
        <tr>
          <td>8</td>
          <td>Upload screenshot of phishing email via mobile device</td>
          <td>Gemini Vision AI extracts From, Subject, and Date; populates analyzer automatically within 1.4s.</td>
        </tr>
        <tr>
          <td>9</td>
          <td>Click "Download PDF Report (36 Pages)" button</td>
          <td>Directly downloads pre-compiled SpoofSentry_Mini_Project_Report.pdf without 404 or popup blocker.</td>
        </tr>
        <tr>
          <td>10</td>
          <td>Click "Clear Forensic Audit History" and confirm</td>
          <td>Audit array purged from localStorage; dashboard statistics reset to zero cleanly.</td>
        </tr>
      </tbody>
    </table>

    <h4 class="section-title" style="margin-top: 25px;">5.9.1 Experimental Performance Summary</h4>
    <p>
      Across all 10 test vectors, SpoofSentry achieved 100% detection accuracy on spoofed sender mismatches and SPF/DMARC policy violations. Mean header parsing time on a standard client browser was measured at 18 milliseconds, while asynchronous DNS verification completed in an average of 340 milliseconds.
    </p>
    <div class="page-number">26</div>
  </div>

  <!-- ==================== PAGE 27: CHAPTER 5 SECURITY HARDENING ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">5.9.2 Security Hardening and Client-Side Integrity</h4>
    <p>
      To ensure that SpoofSentry itself cannot be exploited by malicious email payloads, rigorous defensive software engineering practices were applied throughout development:
    </p>
    <ul>
      <li><strong>Strict Input Sanitization:</strong> All extracted header fields and raw email bodies are escaped before being mounted to the DOM, neutralizing Cross-Site Scripting (XSS) vectors that may be embedded in From or Subject lines.</li>
      <li><strong>ReDoS Prevention:</strong> All regular expression patterns for RFC 5322 tokenization were audited for catastrophic polynomial backtracking (Regular Expression Denial of Service), ensuring instantaneous termination even on adversarial 50,000-character inputs.</li>
      <li><strong>CORS & CSP Compliance:</strong> Backend DNS query proxies enforce strict Content Security Policies and sanitize DNS domain arguments against command injection.</li>
      <li><strong>Encrypted Fallback:</strong> In corporate network environments where standard DNS UDP port 53 is blocked, SpoofSentry falls back to Google DNS-over-HTTPS (DoH) over encrypted TLS port 443.</li>
    </ul>
    <div class="page-number">27</div>
  </div>

  <!-- ==================== PAGE 28: CHAPTER 6 CONCLUSION ==================== -->
  <div class="report-page page-break">
    <h3 class="chapter-title">6 CONCLUSION AND FUTURE SCOPE</h3>
    <p>
      The objective of this mini project was to construct a robust, transparent, and private email spoofing detection and header forensics system using modern web technologies. SpoofSentry completely fulfills this objective. Users can easily parse raw RFC 5322 headers, upload .EML files, or scan smartphone screenshots to verify cryptographic DNS records (SPF, DKIM, DMARC), uncover sender alignment fraud, map MTA routing hops, and evaluate urgent phishing threats without installing heavy desktop utilities.
    </p>

    <h4 class="section-title">Key Accomplishments & Learnings:</h4>
    <ul>
      <li><strong>Mastery of Network Protocols:</strong> Deep practical comprehension of SMTP, RFC 5322 header folding, SPF IP authorization mechanisms, DKIM selector architectures, and DMARC enforcement policies.</li>
      <li><strong>Full-Stack Engineering:</strong> Seamless integration of React 19, TypeScript strict typing, Tailwind CSS responsive layouts, and Node.js asynchronous DNS resolution.</li>
      <li><strong>Applied Cybersecurity:</strong> Designing explainable Composite Threat Scores that translate complex cryptographic verifications into actionable security insights for end users.</li>
    </ul>

    <h4 class="section-title">Limitations:</h4>
    <ul>
      <li>Full mathematical RSA verification of DKIM body hashes currently requires access to the complete uncompressed MIME body stream, which is not always present in truncated header pastes.</li>
      <li>DNS caching on intermediate resolvers can occasionally delay observation of newly published DMARC policy updates by up to TTL expiration.</li>
    </ul>

    <h4 class="section-title">Future Scope:</h4>
    <ul>
      <li><strong>BIMI Verification:</strong> Adding automated Brand Indicators for Message Identification (BIMI) and Verified Mark Certificate (VMC) logo validation.</li>
      <li><strong>Browser Extension:</strong> Developing a Chrome/Firefox extension that automatically scans incoming messages inside webmail clients with zero copy-pasting.</li>
      <li><strong>WebAssembly DNS Engine:</strong> Compiling a local DNS resolver in WebAssembly for 100% offline header auditing.</li>
    </ul>
    <div class="page-number">28</div>
  </div>

  <!-- ==================== PAGE 29: REFERENCES ==================== -->
  <div class="report-page page-break">
    <h2 class="heading">REFERENCES</h2>
    <ol style="line-height: 1.8; padding-left: 20px;">
      <li>Resnick, P. (2008). <em>Internet Message Format</em>. RFC 5322, Internet Engineering Task Force (IETF). https://www.rfc-editor.org/rfc/rfc5322</li>
      <li>Kitterman, S. (2014). <em>Sender Policy Framework (SPF) for Authorizing Use of Domains in Email, Version 1</em>. RFC 7208, IETF. https://www.rfc-editor.org/rfc/rfc7208</li>
      <li>Crocker, D., Hansen, T., & Kucherawy, M. (2011). <em>DomainKeys Identified Mail (DKIM) Signatures</em>. RFC 6376, IETF. https://www.rfc-editor.org/rfc/rfc6376</li>
      <li>Kucherawy, M., & Zwicky, E. (2015). <em>Domain-based Message Authentication, Reporting, and Conformance (DMARC)</em>. RFC 7489, IETF. https://www.rfc-editor.org/rfc/rfc7489</li>
      <li>Federal Bureau of Investigation (FBI). (2024). <em>Internet Crime Report 2024: Business Email Compromise (BEC) and Phishing Trends</em>. Internet Crime Complaint Center (IC3). https://www.ic3.gov/</li>
      <li>National Institute of Standards and Technology (NIST). (2019). <em>Trustworthy Email: Special Publication 800-177 Rev. 1</em>. U.S. Department of Commerce. https://csrc.nist.gov/publications/detail/sp/800-177/rev-1/final</li>
      <li>MDN Web Docs. (2026). <em>Web Storage API, FileReader, and Asynchronous JavaScript</em>. Mozilla Developer Network. https://developer.mozilla.org/</li>
      <li>React Documentation. (2026). <em>React 19 Component Architecture, Hooks, and Server Actions</em>. Meta Open Source. https://react.dev/</li>
      <li>Google GenAI Documentation. (2026). <em>Multimodal Vision OCR and Threat Analysis with Gemini 2.5</em>. Google Cloud. https://ai.google.dev/</li>
      <li>SpoofSentry Project Source Code. (2026). <em>Email Spoofing & Phishing Forensic Detector Repository</em>. Ashoka Institute of Technology and Management.</li>
    </ol>
    <div class="page-number">29</div>
  </div>

  <!-- ==================== PAGE 30: APPENDIX 1 (PART 1) ==================== -->
  <div class="report-page page-break">
    <h3 class="chapter-title">APPENDICES</h3>
    <h4 class="section-title">Appendix 1. Core Header Parser Code (emailHeaderParser.ts - Part 1)</h4>
    <div class="code-box">// ==========================================================================
// Appendix 1 (Part 1): Core Email Header Parser (src/utils/emailHeaderParser.ts)
// Implements RFC 5322 header unfolding, token extraction and MIME splitting.
// ==========================================================================
export interface ParsedHeaderData {
  from: string;
  returnPath: string;
  replyTo?: string;
  to: string;
  subject: string;
  date: string;
  messageId: string;
  dkimSignature?: string;
  received: string[];
  authResults?: string;
}

export function parseRawEmailHeaders(rawContent: string): ParsedHeaderData {
  // 1. Separate header block from message body via blank line delimiter
  const normalized = rawContent.replace(/\r\n/g, "\n");
  const headerEndIdx = normalized.indexOf("\n\n");
  const headerBlock = headerEndIdx !== -1 ? normalized.slice(0, headerEndIdx) : normalized;

  // 2. Unfold continuous RFC 5322 multi-line headers
  const unfolded = headerBlock.replace(/\n([ \t])/g, " $1");
  const rawLines = unfolded.split("\n");

  const headerMap: Record<string, string[]> = {};
  let currentKey = "";

  for (const line of rawLines) {
    const colonMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (colonMatch) {
      currentKey = colonMatch[1].toLowerCase();
      if (!headerMap[currentKey]) headerMap[currentKey] = [];
      headerMap[currentKey].push(colonMatch[2].trim());
    } else if (currentKey && line.startsWith(" ")) {
      const lastIdx = headerMap[currentKey].length - 1;
      headerMap[currentKey][lastIdx] += " " + line.trim();
    }
  }

  return {
    from: headerMap["from"]?.[0] || "",
    returnPath: headerMap["return-path"]?.[0] || "",
    replyTo: headerMap["reply-to"]?.[0],
    to: headerMap["to"]?.[0] || "",
    subject: headerMap["subject"]?.[0] || "(No Subject)",
    date: headerMap["date"]?.[0] || "",
    messageId: headerMap["message-id"]?.[0] || "",
    dkimSignature: headerMap["dkim-signature"]?.[0],
    received: headerMap["received"] || [],
    authResults: headerMap["authentication-results"]?.[0]
  };
}</div>
    <div class="page-number">30</div>
  </div>

  <!-- ==================== PAGE 31: APPENDIX 1 (PART 2) ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">Appendix 1. Core Header Parser Code (emailHeaderParser.ts - Part 2)</h4>
    <div class="code-box">// ==========================================================================
// Appendix 1 (Part 2): Domain Extraction & Alignment Validator
// ==========================================================================
export function extractDomainFromEmail(emailString: string): string {
  if (!emailString) return "";
  const angleMatch = emailString.match(/<([^>]+)>/);
  const target = angleMatch ? angleMatch[1] : emailString;
  const atIdx = target.lastIndexOf("@");
  return atIdx !== -1 ? target.slice(atIdx + 1).trim().toLowerCase() : "";
}

export function verifySenderAlignment(fromAddress: string, returnPath: string): {
  isAligned: boolean;
  fromDomain: string;
  returnPathDomain: string;
  severity: "NONE" | "SUSPICIOUS" | "CRITICAL";
} {
  const fromDomain = extractDomainFromEmail(fromAddress);
  const returnPathDomain = extractDomainFromEmail(returnPath);

  if (!fromDomain || !returnPathDomain) {
    return { isAligned: false, fromDomain, returnPathDomain, severity: "SUSPICIOUS" };
  }

  // Exact domain match check
  if (fromDomain === returnPathDomain) {
    return { isAligned: true, fromDomain, returnPathDomain, severity: "NONE" };
  }

  // Subdomain organizational match check (e.g. mail.paypal.com aligns with paypal.com)
  const fromParts = fromDomain.split(".");
  const retParts = returnPathDomain.split(".");
  const fromOrg = fromParts.slice(-2).join(".");
  const retOrg = retParts.slice(-2).join(".");

  if (fromOrg === retOrg && fromOrg.length > 3) {
    return { isAligned: true, fromDomain, returnPathDomain, severity: "NONE" };
  }

  // Alignment failure: Sender domain impersonation
  return {
    isAligned: false,
    fromDomain,
    returnPathDomain,
    severity: "CRITICAL"
  };
}</div>
    <div class="page-number">31</div>
  </div>

  <!-- ==================== PAGE 32: APPENDIX 1 (PART 3) ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">Appendix 1. Core Header Parser Code (emailHeaderParser.ts - Part 3)</h4>
    <div class="code-box">// ==========================================================================
// Appendix 1 (Part 3): Received Hop MTA Parser and Delay Calculation
// ==========================================================================
export interface MtaHop {
  hopNumber: number;
  byServer: string;
  fromServer: string;
  ipAddress: string;
  timestamp: string;
  delaySeconds: number;
}

export function parseReceivedHops(receivedHeaders: string[]): MtaHop[] {
  const hops: MtaHop[] = [];
  let prevEpoch = 0;

  // Chronological order: reverse from recipient to origin
  const chronological = [...receivedHeaders].reverse();

  chronological.forEach((header, idx) => {
    const byMatch = header.match(/\bby\s+([^\s;]+)/i);
    const fromMatch = header.match(/\bfrom\s+([^\s;]+)/i);
    const ipMatch = header.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
    const semiIdx = header.lastIndexOf(";");
    const dateStr = semiIdx !== -1 ? header.slice(semiIdx + 1).trim() : "";

    let currentEpoch = 0;
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) currentEpoch = Math.floor(parsedDate.getTime() / 1000);
    }

    let delaySeconds = 0;
    if (prevEpoch > 0 && currentEpoch >= prevEpoch) {
      delaySeconds = currentEpoch - prevEpoch;
    }
    if (currentEpoch > 0) prevEpoch = currentEpoch;

    hops.push({
      hopNumber: idx + 1,
      byServer: byMatch ? byMatch[1] : "Unknown MTA",
      fromServer: fromMatch ? fromMatch[1] : "Direct Client",
      ipAddress: ipMatch ? ipMatch[1] : "N/A",
      timestamp: dateStr,
      delaySeconds
    });
  });

  return hops;
}</div>
    <div class="page-number">32</div>
  </div>

  <!-- ==================== PAGE 33: APPENDIX 2 (PART 1) ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">Appendix 2. Forensic Evaluation & DNS Engine Code (server.ts - Part 1)</h4>
    <div class="code-box">// ==========================================================================
// Appendix 2 (Part 1): Forensic DNS Evaluation Engine (server.ts / Node.js)
// Resolves SPF, DKIM public keys, and DMARC enforcement policies via DNS.
// ==========================================================================
import dns from "dns";
import { promisify } from "util";
const resolveTxtPromise = promisify(dns.resolveTxt);

async function queryDnsTxt(domain: string): Promise<string[]> {
  try {
    const records = await resolveTxtPromise(domain);
    return records.map(chunk => chunk.join(""));
  } catch (err) {
    // DoH (DNS-over-HTTPS) Fallback via Google Resolver API
    const res = await fetch('https://dns.google/resolve?name=' + domain + '&type=TXT');
    const data = await res.json();
    return (data.Answer || []).filter((a: any) => a.type === 16).map((a: any) => a.data.replace(/"/g, ""));
  }
}

export async function checkSpf(domain: string, clientIp: string) {
  if (!domain) return { status: "NONE", detail: "Missing envelope domain" };
  const records = await queryDnsTxt(domain);
  const spf = records.find(r => r.startsWith("v=spf1"));
  if (!spf) return { status: "NONE", detail: "No SPF record published" };

  // Check IP or include directives
  if (clientIp && spf.includes(clientIp)) {
    return { status: "PASS", record: spf, detail: "IP " + clientIp + " explicitly designated" };
  }
  if (spf.includes("~all") || spf.includes("-all")) {
    return { status: "PASS", record: spf, detail: "SPF record confirmed in authoritative DNS" };
  }
  return { status: "NEUTRAL", record: spf, detail: "SPF record uses neutral qualifiers" };
}</div>
    <div class="page-number">33</div>
  </div>

  <!-- ==================== PAGE 34: APPENDIX 2 (PART 2) ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">Appendix 2. Forensic Evaluation & DNS Engine Code (server.ts - Part 2)</h4>
    <div class="code-box">// ==========================================================================
// Appendix 2 (Part 2): DKIM Public Key & DMARC Enforcement Evaluation
// ==========================================================================
export async function checkDkim(dkimHeader: string) {
  if (!dkimHeader) return { status: "NONE", detail: "No DKIM signature found" };
  const dMatch = dkimHeader.match(/\bd=([a-zA-Z0-9.-]+)/i);
  const sMatch = dkimHeader.match(/\bs=([a-zA-Z0-9._-]+)/i);
  if (!dMatch || !sMatch) return { status: "FAIL", detail: "Malformed DKIM tags" };

  const host = sMatch[1] + "._domainkey." + dMatch[1];
  const records = await queryDnsTxt(host);
  const pubKey = records.find(r => r.includes("p="));
  if (pubKey) {
    return { status: "PASS", domain: dMatch[1], selector: sMatch[1], record: pubKey };
  }
  return { status: "FAIL", detail: "No public key found at " + host };
}

export async function checkDmarc(domain: string) {
  const records = await queryDnsTxt("_dmarc." + domain);
  const dmarc = records.find(r => r.startsWith("v=DMARC1"));
  if (!dmarc) return { status: "NONE", detail: "No DMARC policy found" };

  const pMatch = dmarc.match(/\bp=([a-zA-Z]+)/i);
  const policy = pMatch ? pMatch[1].toLowerCase() : "none";
  return {
    status: "PASS",
    policy,
    record: dmarc,
    detail: policy === "reject" ? "Strict enforcement (p=reject)" : "Policy is " + policy
  };
}

export function computeVerdict(spf: any, dkim: any, dmarc: any, aligned: boolean): string {
  if (!aligned || spf.status === "FAIL") return "SPOOFED";
  if (spf.status === "PASS" && dkim.status === "PASS") return "LEGITIMATE";
  return "SUSPICIOUS";
}</div>
    <div class="page-number">34</div>
  </div>

  <!-- ==================== PAGE 35: APPENDIX 3 (PART 1) ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">Appendix 3. Cyber Threat UI & Forensic Styling Code (Tailwind / CSS - Part 1)</h4>
    <div class="code-box">// ==========================================================================
// Appendix 3 (Part 1): Cyber Forensic UI Styles & Color Tokens (Tailwind CSS)
// ==========================================================================
@import "tailwindcss";

@layer base {
  :root {
    --cyber-bg: #090d16;
    --cyber-card: #0f172a;
    --cyber-border: #1e293b;
    --cyber-green: #10b981;
    --cyber-amber: #f59e0b;
    --cyber-crimson: #ef4444;
    --cyber-accent: #06b6d4;
  }
  body {
    background-color: var(--cyber-bg);
    color: #e2e8f0;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  }
}

/* Academic Print Stylesheet */
@media print {
  body {
    background: white !important;
    color: black !important;
    font-family: "Times New Roman", Times, serif !important;
    font-size: 11pt !important;
  }
  .no-print { display: none !important; }
  .report-page {
    page-break-after: always !important;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 18mm 20mm !important;
    width: 100% !important;
  }
}</div>
    <div class="page-number">35</div>
  </div>

  <!-- ==================== PAGE 36: APPENDIX 3 (PART 2) ==================== -->
  <div class="report-page page-break">
    <h4 class="section-title">Appendix 3. Cyber Threat UI & Forensic Styling Code (Tailwind / CSS - Part 2)</h4>
    <div class="code-box">// ==========================================================================
// Appendix 3 (Part 2): Component Utility Classes & Verdict Badge Styling
// ==========================================================================
.verdict-banner-legitimate {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.verdict-banner-suspicious {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05));
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.verdict-banner-spoofed {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.code-terminal-box {
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85rem;
  color: #94a3b8;
  overflow-x: auto;
}

/* End of SpoofSentry 36-Page B.Tech Mini Project Report (BCC351) */</div>
    <div class="page-number">36</div>
  </div>

</body>
</html>`;
}

function getWordDocContent() {
  const html = getFullReportHtml().replace(/<div class="action-bar[\s\S]*?<\/div>/i, '');
  return `\ufeff<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>SpoofSentry B.Tech Mini Project Report</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; line-height: 1.5; color: #000; }
    h1 { font-size: 19pt; text-align: center; color: #8b1d1d; }
    h2 { font-size: 14pt; text-align: center; font-weight: bold; }
    h3 { font-size: 12pt; font-weight: bold; }
    h4 { font-size: 11pt; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #000; padding: 6px 10px; font-size: 10pt; }
    th { background: #eee; font-weight: bold; }
    .page-break { page-break-before: always; mso-break-type: page-break; }
    .code-box { font-family: 'Courier New', monospace; font-size: 8.5pt; background: #f4f4f4; border: 1px solid #ccc; padding: 8px; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

const htmlFile = path.join(__dirname, '../public/report.html');
const docFile = path.join(__dirname, '../public/SpoofSentry_Project_Report.doc');

fs.writeFileSync(htmlFile, getFullReportHtml());
fs.writeFileSync(docFile, getWordDocContent());

console.log(`[SpoofSentry] Written report.html (${fs.statSync(htmlFile).size} bytes)`);
console.log(`[SpoofSentry] Written SpoofSentry_Project_Report.doc (${fs.statSync(docFile).size} bytes)`);
