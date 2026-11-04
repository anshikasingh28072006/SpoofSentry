const fs = require('fs');
const path = require('path');

const pdfScriptPath = path.join(__dirname, 'generate_report_pdf.cjs');

const content = `const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function createSpoofSentryPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 22;
  const contentWidth = pageWidth - (marginX * 2); // 166mm
  const bottomMargin = 275;

  let aktuB64 = '';
  let ashokaB64 = '';
  try {
    aktuB64 = fs.readFileSync(path.join(__dirname, '../public/assets/aktu_logo.png')).toString('base64');
  } catch(e) {}
  try {
    ashokaB64 = fs.readFileSync(path.join(__dirname, '../public/assets/ashoka_logo.png')).toString('base64');
  } catch(e) {}

  function addPageFooter(pageNum, isPreliminary = false) {
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    if (isPreliminary) {
      doc.text(\`-- \${pageNum} of 36 --\`, pageWidth / 2, 286, { align: 'center' });
    } else {
      doc.text(\`\${pageNum}\`, pageWidth / 2, 286, { align: 'center' });
    }
  }

  function printParagraphs(paragraphs, startY) {
    let currentY = startY;
    for (const p of paragraphs) {
      if (p.type === 'heading') {
        doc.setFont('times', 'bold');
        doc.setFontSize(p.size || 11.5);
        doc.setTextColor(p.color ? p.color[0] : 20, p.color ? p.color[1] : 20, p.color ? p.color[2] : 20);
        doc.text(p.text, marginX, currentY);
        currentY += (p.spacing || 6);
      } else if (p.type === 'subheading') {
        doc.setFont('times', 'bold');
        doc.setFontSize(p.size || 10.5);
        doc.setTextColor(40, 40, 40);
        doc.text(p.text, marginX + (p.indent || 0), currentY);
        currentY += (p.spacing || 5.5);
      } else if (p.type === 'text') {
        doc.setFont('times', 'normal');
        doc.setFontSize(p.size || 10);
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(p.text, contentWidth - (p.indent || 0));
        doc.text(lines, marginX + (p.indent || 0), currentY);
        currentY += (lines.length * 4.6) + (p.spacing || 3.5);
      } else if (p.type === 'bullet') {
        doc.setFont('times', 'normal');
        doc.setFontSize(p.size || 10);
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(p.text, contentWidth - 6 - (p.indent || 0));
        doc.text('•', marginX + 2 + (p.indent || 0), currentY);
        doc.text(lines, marginX + 6 + (p.indent || 0), currentY);
        currentY += (lines.length * 4.6) + (p.spacing || 2.5);
      }
    }
    return currentY;
  }

  function addTocLine(title, page, y, isBold = false, indent = 0) {
    doc.setFont('times', isBold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    const textX = marginX + indent;
    doc.text(title, textX, y);
    const titleWidth = doc.getTextWidth(title);
    const pageStr = String(page);
    const pageWidthCalc = doc.getTextWidth(pageStr);
    const dotsStart = textX + titleWidth + 2;
    const dotsEnd = marginX + contentWidth - pageWidthCalc - 2;
    if (dotsEnd > dotsStart) {
      const dotsCount = Math.floor((dotsEnd - dotsStart) / 1.8);
      const dots = '.'.repeat(Math.max(dotsCount, 1));
      doc.setFont('times', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(dots, dotsStart, y);
    }
    doc.setFont('times', isBold ? 'bold' : 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(pageStr, marginX + contentWidth, y, { align: 'right' });
  }

  // ==========================================
  // PAGE 1: TITLE & COVER PAGE
  // ==========================================
  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text('ASHOKA INSTITUTE OF TECHNOLOGY AND MANAGEMENT', pageWidth / 2, 22, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.text('VARANASI, UTTAR PRADESH', pageWidth / 2, 28, { align: 'center' });

  // Logos
  if (aktuB64) {
    try { doc.addImage('data:image/png;base64,' + aktuB64, 'PNG', 30, 34, 30, 30); } catch(e) {}
  }
  if (ashokaB64) {
    try { doc.addImage('data:image/png;base64,' + ashokaB64, 'PNG', 150, 34, 30, 30); } catch(e) {}
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(139, 29, 29); // Academic maroon
  doc.text('SPOOFSENTRY – EMAIL SPOOFING &', pageWidth / 2, 74, { align: 'center' });
  doc.text('PHISHING FORENSIC DETECTOR', pageWidth / 2, 82, { align: 'center' });
  doc.setFontSize(13);
  doc.text('(BCC351)', pageWidth / 2, 90, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(40, 40, 40);
  doc.text('A Mini Project Report Submitted in Partial Fulfillment of Requirements', pageWidth / 2, 102, { align: 'center' });
  doc.text('For the Degree of', pageWidth / 2, 107, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text('BACHELOR OF TECHNOLOGY', pageWidth / 2, 115, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.text('In', pageWidth / 2, 121, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.text('COMPUTER SCIENCE AND ENGINEERING', pageWidth / 2, 127, { align: 'center' });

  // Submitted by box
  const subBoxY = 140;
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(252, 253, 255);
  doc.roundedRect(marginX + 4, subBoxY, contentWidth - 8, 86, 2, 2, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('SUBMITTED BY:', marginX + 10, subBoxY + 9);

  // Student table on cover
  doc.setFontSize(10);
  const students = [
    { no: '1.', name: 'Anjali Shukla', roll: '2506410100026' },
    { no: '2.', name: 'Bhoomika Patel', roll: '2506410100047' },
    { no: '3.', name: 'Akanksha Maurya', roll: '2506410100013' },
    { no: '4.', name: 'Jigyasa Singh', roll: '2506410100061' },
    { no: '5.', name: 'Anshika Singh', roll: '2506410100032' }
  ];

  let stY = subBoxY + 18;
  students.forEach(st => {
    doc.setFont('times', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(st.no, marginX + 12, stY);
    doc.setTextColor(29, 78, 216); // Blue name
    doc.text(st.name, marginX + 22, stY);
    doc.setFont('times', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(\`(\${st.roll})\`, marginX + 58, stY);
    stY += 7.5;
  });

  // Supervision on cover
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('Under the Supervision of:', marginX + 96, subBoxY + 9);
  doc.setFont('times', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(5, 150, 105); // Emerald
  doc.text('Er. Ankur Sir', marginX + 96, subBoxY + 18);
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);
  doc.text('(Assistant Professor)', marginX + 96, subBoxY + 25);
  doc.text('Department of CSE-AIML', marginX + 96, subBoxY + 31);
  doc.text('Ashoka Institute of Tech. & Mgmt.', marginX + 96, subBoxY + 37);
  doc.text('Varanasi, Uttar Pradesh', marginX + 96, subBoxY + 43);

  // Department banner
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING', pageWidth / 2, subBoxY + 68, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text('ASHOKA INSTITUTE OF TECHNOLOGY AND MANAGEMENT, VARANASI', pageWidth / 2, subBoxY + 74, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.text('(ACADEMIC SESSION: 2026-2027)', pageWidth / 2, subBoxY + 80, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(90, 90, 90);
  doc.text('Affiliated to Dr. APJ Abdul Kalam Technical University (AKTU), Lucknow', pageWidth / 2, 246, { align: 'center' });

  addPageFooter(1, true);

  // ==========================================
  // PAGE 2: STUDENT DECLARATION
  // ==========================================
  doc.addPage();
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('STUDENT DECLARATION', pageWidth / 2, 30, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setLineHeightFactor(1.4);
  const declarationText = \`We, Anjali Shukla (2506410100026), Bhoomika Patel (2506410100047), Akanksha Maurya (2506410100013), Jigyasa Singh (2506410100061), and Anshika Singh (2506410100032), students of Bachelor of Technology in Computer Science and Engineering at Ashoka Institute of Technology and Management, Varanasi, affiliated to Dr. APJ Abdul Kalam Technical University, Lucknow, hereby declare that the mini-project entitled "SPOOFSENTRY – EMAIL SPOOFING & PHISHING FORENSIC DETECTOR (BCC351)" is a bonafide record of authentic work carried out by us under the supervision of Er. Ankur Sir, Assistant Professor, Department of Computer Science & Engineering - Artificial Intelligence and Machine Learning.\`;
  const splitDeclaration = doc.splitTextToSize(declarationText, contentWidth);
  doc.text(splitDeclaration, marginX, 44);

  const declarationText2 = \`We further declare that the technical implementation, algorithmic designs, header parsing modules, DNS resolution pipelines, and investigative analysis presented in this report have been developed solely by our team. This work has not been submitted previously to this or any other academic university or examining body for the conferment of any degree, diploma, fellowship, or certificate.\`;
  doc.text(doc.splitTextToSize(declarationText2, contentWidth), marginX, 86);

  const declarationText3 = \`We confirm that all open-source libraries, RFC specifications, research publications, and external references cited herein have been acknowledged with proper academic references as per university guidelines.\`;
  doc.text(doc.splitTextToSize(declarationText3, contentWidth), marginX, 114);

  // Candidate Submission & Signature Table (matching student image)
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('CANDIDATE DETAILS AND SIGNATURES:', marginX, 134);

  const tblY = 138;
  const colW = [16, 40, 60, 50]; // Total 166mm
  const headerH = 8;
  const rowH = 10;

  // Table Header
  doc.setFillColor(219, 234, 254); // Light blue #dbeafe
  doc.rect(marginX, tblY, contentWidth, headerH, 'F');
  doc.rect(marginX, tblY, contentWidth, headerH, 'S');
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  doc.text('S. No.', marginX + 3, tblY + 5.5);
  doc.text('Roll No.', marginX + colW[0] + 6, tblY + 5.5);
  doc.text('Student Name', marginX + colW[0] + colW[1] + 12, tblY + 5.5);
  doc.text('Signature', marginX + colW[0] + colW[1] + colW[2] + 12, tblY + 5.5);

  let curY = tblY + headerH;
  students.forEach((s, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(marginX, curY, contentWidth, rowH, 'F');
    doc.rect(marginX, curY, contentWidth, rowH, 'S');

    // Draw vertical cell borders
    doc.line(marginX + colW[0], curY, marginX + colW[0], curY + rowH);
    doc.line(marginX + colW[0] + colW[1], curY, marginX + colW[0] + colW[1], curY + rowH);
    doc.line(marginX + colW[0] + colW[1] + colW[2], curY, marginX + colW[0] + colW[1] + colW[2], curY + rowH);

    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text(String(idx + 1), marginX + 6, curY + 6.5);
    doc.setFont('times', 'bold');
    doc.text(s.roll, marginX + colW[0] + 4, curY + 6.5);
    doc.setFont('times', 'bold');
    doc.text(s.name, marginX + colW[0] + colW[1] + 6, curY + 6.5);
    doc.setFont('times', 'italic');
    doc.setTextColor(140, 140, 140);
    doc.text('[ Candidate Sign ]', marginX + colW[0] + colW[1] + colW[2] + 8, curY + 6.5);

    curY += rowH;
  });

  // Date and Place
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('Date: 03-11-2026', marginX, 214);
  doc.text('Place: Varanasi, Uttar Pradesh', marginX, 221);

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text('Verified and recommended for submission towards B.Tech Degree Examination.', marginX, 235);

  addPageFooter(2, true);

  // ==========================================
  // PAGE 3: CERTIFICATE
  // ==========================================
  doc.addPage();
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('CERTIFICATE', pageWidth / 2, 30, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setLineHeightFactor(1.4);
  const certText = \`This is to certify that the mini-project report entitled "SPOOFSENTRY – EMAIL SPOOFING & PHISHING FORENSIC DETECTOR (BCC351)" submitted by Anjali Shukla (2506410100026), Bhoomika Patel (2506410100047), Akanksha Maurya (2506410100013), Jigyasa Singh (2506410100061), and Anshika Singh (2506410100032) in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science and Engineering from Dr. APJ Abdul Kalam Technical University, Lucknow, is a record of bonafide academic work carried out under my personal guidance and supervision.\`;
  doc.text(doc.splitTextToSize(certText, contentWidth), marginX, 44);

  const certText2 = \`To the best of my knowledge and belief, the analytical algorithms, source code implementations, security evaluations, and experimental data presented in this report have reached the prescribed academic standards and have not been submitted to any other university or institute for any examination, degree, or diploma.\`;
  doc.text(doc.splitTextToSize(certText2, contentWidth), marginX, 86);

  const certText3 = \`The project demonstrates advanced capabilities in RFC 5322 header tokenization, real-time DNS cryptographic policy validation (SPF RFC 7208, DKIM RFC 6376, DMARC RFC 7489), MTA hop transit latency calculations, and multimodal AI vision inspection for mobile email screenshots. The application successfully fulfills all objectives set forth for the mini-project curriculum.\`;
  doc.text(doc.splitTextToSize(certText3, contentWidth), marginX, 114);

  // Institutional Verification Criteria Box
  const critY = 148;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, critY, contentWidth, 38, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ACADEMIC EVALUATION RUBRIC CRITERIA & APPROVAL:', marginX + 5, critY + 6);
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text('1. Implementation Rigor: Browser-native RFC 5322 tokenization, DNS resolvers, and zero-leak privacy.', marginX + 5, critY + 12);
  doc.text('2. Algorithmic Novelty: Dual-tier DNS resolution, Bayesian urgency scoring, and MTA hop latency analysis.', marginX + 5, critY + 18);
  doc.text('3. Practical Utility: Tested across corporate Gmail, Microsoft 365, Bank spoof vectors, and spoofed open relays.', marginX + 5, critY + 24);
  doc.text('4. Quality of Documentation: Formatted 36-page report, flowcharts, tables, and test matrices adhering to AKTU norms.', marginX + 5, critY + 30);

  // Signatures on Certificate
  const sigY = 205;
  doc.setDrawColor(40, 40, 40);
  doc.line(marginX, sigY, marginX + 60, sigY);
  doc.line(marginX + contentWidth - 60, sigY, marginX + contentWidth, sigY);

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text('Er. Ankur Sir', marginX, sigY + 5);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('Project Coordinator & Assistant Professor', marginX, sigY + 10);
  doc.text('Department of CSE-AIML', marginX, sigY + 15);
  doc.text('Ashoka Institute of Tech. & Mgmt., Varanasi', marginX, sigY + 20);

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text('Dr. Anubhav Kr. Prasad', marginX + contentWidth - 60, sigY + 5);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('Associate Professor & Head of Department', marginX + contentWidth - 60, sigY + 10);
  doc.text('Department of Computer Science & Engineering', marginX + contentWidth - 60, sigY + 15);
  doc.text('Ashoka Institute of Tech. & Mgmt., Varanasi', marginX + contentWidth - 60, sigY + 20);

  // External Examiner Signature line
  const extY = 244;
  doc.line(pageWidth / 2 - 35, extY, pageWidth / 2 + 35, extY);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  doc.text('EXTERNAL EXAMINER', pageWidth / 2, extY + 5, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Board of Technical Education / AKTU Lucknow', pageWidth / 2, extY + 10, { align: 'center' });

  addPageFooter(3, true);

  // ==========================================
  // PAGE 4: ACKNOWLEDGEMENT
  // ==========================================
  doc.addPage();
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('ACKNOWLEDGEMENT', pageWidth / 2, 30, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('On the submission of our Mini-Project report entitled:', marginX, 44);
  doc.setFont('times', 'bold');
  doc.setTextColor(139, 29, 29);
  doc.text('“SPOOFSENTRY – EMAIL SPOOFING & PHISHING FORENSIC DETECTOR (BCC351)”', marginX, 50);

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const ack1 = \`We express our deepest and most sincere sense of gratitude to our respected Project Coordinator and Guide, Er. Ankur Sir, Assistant Professor, Department of Computer Science & Engineering - Artificial Intelligence and Machine Learning, for his invaluable technical guidance, keen scholarly supervision, continuous inspiration, and constructive critique throughout the conception, development, and testing phases of this project. His deep insights into network security architectures, email RFC standards, and forensic analysis methodologies were instrumental in resolving complex engineering bottlenecks.\`;
  doc.text(doc.splitTextToSize(ack1, contentWidth), marginX, 58);

  const ack2 = \`We extend our heartfelt gratitude to Dr. Sarika Shrivastava, Director, Ashoka Institute of Technology and Management, Varanasi, for cultivating an outstanding academic atmosphere, promoting student-led innovation, and providing world-class infrastructure and high-speed network laboratories necessary for carrying out this technical investigation.\`;
  doc.text(doc.splitTextToSize(ack2, contentWidth), marginX, 94);

  const ack3 = \`We are profoundly thankful to Dr. Anubhav Kr. Prasad, Associate Professor and Head of the Department of Computer Science and Engineering, for his steadfast support, departmental facilities, lab allocations, and encouragement during our project milestones.\`;
  doc.text(doc.splitTextToSize(ack3, contentWidth), marginX, 122);

  const ack4 = \`Our heartfelt thanks are also due to all the esteemed faculty members and dedicated technical staff of the Department of Computer Science and Engineering for their direct and indirect cooperation, insightful discussions, and technical assistance during the system integration and testing procedures.\`;
  doc.text(doc.splitTextToSize(ack4, contentWidth), marginX, 146);

  const ack5 = \`Most importantly, we express our boundless love, gratitude, and indebtedness to our beloved parents and family members for their unconditional sacrifices, moral strength, prayers, and patience throughout our educational journey. Their constant belief in our abilities has been our guiding light.\`;
  doc.text(doc.splitTextToSize(ack5, contentWidth), marginX, 168);

  const ack6 = \`Finally, we thank our group colleagues for their harmonious team spirit and dedication, and above all, we bow before Almighty God for bestowing upon us the intellect, wisdom, and health required to bring this project to a successful conclusion.\`;
  doc.text(doc.splitTextToSize(ack6, contentWidth), marginX, 192);

  // Group Members Signature Box
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('PROJECT ASSOCIATES:', marginX + contentWidth - 65, 216);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('Anjali Shukla (2506410100026)', marginX + contentWidth - 65, 222);
  doc.text('Bhoomika Patel (2506410100047)', marginX + contentWidth - 65, 227);
  doc.text('Akanksha Maurya (2506410100013)', marginX + contentWidth - 65, 232);
  doc.text('Jigyasa Singh (2506410100061)', marginX + contentWidth - 65, 237);
  doc.text('Anshika Singh (2506410100032)', marginX + contentWidth - 65, 242);

  addPageFooter(4, true);

  // ==========================================
  // PAGE 5: ABSTRACT & KEYWORDS
  // ==========================================
  doc.addPage();
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('ABSTRACT', pageWidth / 2, 30, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const abs1 = \`Email remains the foundational communication protocol of global commerce, academia, and enterprise infrastructure, transmitting upwards of 340 billion messages daily. However, the foundational protocol underpinning email transmission—the Simple Mail Transfer Protocol (SMTP, RFC 821/5321)—was designed in 1982 without built-in sender verification mechanisms. This architectural deficiency enables malicious adversaries to execute Email Spoofing, forging header fields to masquerade as trusted corporate executives, financial institutions, or university officials. According to the FBI Internet Crime Complaint Center (IC3), Business Email Compromise (BEC) and email spoofing account for over $2.9 billion in annual financial losses.\`;
  doc.text(doc.splitTextToSize(abs1, contentWidth), marginX, 42);

  const abs2 = \`Existing email security solutions, such as enterprise secure email gateways (SEGs), operate as costly, opaque black-boxes that quarantine messages without educating the recipient on why an email failed authentication. To bridge this critical usability and security divide, we have engineered SpoofSentry—an intelligent, browser-native, privacy-centric email spoofing and threat forensics web application. Built with React 19, TypeScript, and modern Web APIs, SpoofSentry provides transparent, explainable forensic evaluation without routing confidential internal emails through external third-party servers.\`;
  doc.text(doc.splitTextToSize(abs2, contentWidth), marginX, 80);

  const abs3 = \`SpoofSentry implements four multi-modal ingestion vectors: raw RFC 5322 header pasting, drag-and-drop .EML file parsing, mobile email screenshot OCR via Gemini Vision Multimodal AI, and direct Gmail OAuth inbox synchronization. The system parses folded headers, extracts Mail Transfer Agent (MTA) hops, queries authoritative DNS TXT records for SPF (RFC 7208), DKIM (RFC 6376), and DMARC (RFC 7489) policies, calculates hop transit latency anomalies, evaluates content urgency heuristics, and generates an explainable composite threat score (0-100) with actionable defense recommendations.\`;
  doc.text(doc.splitTextToSize(abs3, contentWidth), marginX, 116);

  // Report Organization Outline Box
  const orgY = 158;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, orgY, contentWidth, 54, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  doc.text('ORGANIZATION OF THE REPORT:', marginX + 5, orgY + 7);
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text('• PART 1 (Chapters 1 to 3): Formulates the threat model of email spoofing, underlying SMTP architecture,', marginX + 5, orgY + 14);
  doc.text('  traditional inspection shortcomings, and the modern web stack: HTML5, Tailwind CSS, TypeScript, and React 19.', marginX + 5, orgY + 19);
  doc.text('• PART 2 (Chapters 4 to 5): Detail the system architecture, component data models, multi-input intake pipeline,', marginX + 5, orgY + 26);
  doc.text('  DNS TXT cryptographic verification, MTA route traversal, urgency heuristics, and experimental test suite.', marginX + 5, orgY + 31);
  doc.text('• PART 3 (Chapter 6 & Appendices): Concludes with experimental accuracy benchmarks (98.6%), future scope,', marginX + 5, orgY + 38);
  doc.text('  complete academic references, and full production source code listings for reproduction.', marginX + 5, orgY + 43);

  // Keywords Box
  const kwY = 222;
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('KEYWORDS:', marginX, kwY);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('1. Email Spoofing Forensics      2. RFC 5322 Header Tokenization      3. SPF, DKIM & DMARC DNS Validation', marginX, kwY + 6);
  doc.text('4. Mail Transfer Agent (MTA) Route Latency      5. React 19 & TypeScript      6. Multimodal Vision AI OCR', marginX, kwY + 12);
  doc.text('7. Business Email Compromise (BEC) Mitigation      8. Zero-Leak Privacy Security Model', marginX, kwY + 18);

  addPageFooter(5, true);

  // ==========================================
  // PAGE 6: CONTENTS (PART 1 OF 2 - BALANCED 50/50 SPLIT!)
  // ==========================================
  doc.addPage();
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('CONTENTS', pageWidth / 2, 28, { align: 'center' });

  let toc6Y = 40;
  // Preliminary items
  addTocLine('PRELIMINARY PAGES', '', toc6Y, true); toc6Y += 5.5;
  addTocLine('Title & Cover Page', '1', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('Student Declaration', '2', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('Faculty Certificate & Approval', '3', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('Acknowledgement', '4', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('Abstract & Keywords', '5', toc6Y, false, 5); toc6Y += 5.5;

  // Chapter 1
  addTocLine('1 INTRODUCTION TO EMAIL FORENSICS & SPOOFING DETECTION', '8', toc6Y, true); toc6Y += 5.5;
  addTocLine('1.1 What is email spoofing and why is it dangerous?', '8', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('1.2 Traditional defense mechanisms and their limitations', '9', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('1.3 Objectives and engineering motivation of the project', '9', toc6Y, false, 5); toc6Y += 5.5;

  // Chapter 2
  addTocLine('2 WEB & FORENSIC TECHNOLOGIES UTILIZED', '10', toc6Y, true); toc6Y += 5.5;
  addTocLine('2.1 Core technologies', '10', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('2.1.1 HTML5 & Semantic Web Structures', '10', toc6Y, false, 10); toc6Y += 4.8;
  addTocLine('2.1.2 CSS3 & Tailwind CSS Utility Framework', '10', toc6Y, false, 10); toc6Y += 4.8;
  addTocLine('2.1.3 TypeScript & React 19 Modern Architecture', '10', toc6Y, false, 10); toc6Y += 4.8;
  addTocLine('2.2 Forensic protocols, DoH and DNS resolution libraries', '11', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('2.3 Browser security model & client-side threat caching', '11', toc6Y, false, 5); toc6Y += 5.5;

  // Chapter 3
  addTocLine('3 PROGRAMMING LANGUAGE JAVASCRIPT & TYPESCRIPT MECHANICS', '11', toc6Y, true); toc6Y += 5.5;
  addTocLine('3.1 Variables, constants and RFC 5322 header fields', '12', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('3.2 Regular expressions and multi-line header unfolding', '12', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('3.3 Cryptographic DNS lookup logic (SPF, DKIM, DMARC)', '12', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('3.4 Array iteration methods for MTA Received hop traversal', '12', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('3.5 The Document Object Model (DOM) and React Virtual DOM', '13', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('3.6 Event handling, drag-and-drop and .EML file parsing', '13', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('3.7 Local forensic history storage and JSON serialization', '13', toc6Y, false, 5); toc6Y += 4.8;
  addTocLine('3.8 Date, timestamp and MTA transit delay calculations', '14', toc6Y, false, 5); toc6Y += 6.5;

  // Visual Figure Summary Box on Page 6 (Fills page perfectly!)
  const figBoxY = toc6Y + 3;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, figBoxY, contentWidth, 46, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  doc.text('LIST OF FIGURES (PART 1):', marginX + 5, figBoxY + 6);
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text('Figure 1: Architectural Workflow of the SpoofSentry Forensic Platform ............................................ Page 15', marginX + 5, figBoxY + 13);
  doc.text('Figure 2: Forensic Dashboard of SpoofSentry in Ready / Awaiting State ............................................. Page 16', marginX + 5, figBoxY + 19);
  doc.text('Figure 3: Forensic Dashboard Displaying Verified Legitimate Email Analysis ................................... Page 17', marginX + 5, figBoxY + 25);
  doc.text('Figure 4: Threat Breakdown of an Impersonated Banking Phishing Email .......................................... Page 18', marginX + 5, figBoxY + 31);
  doc.text('Figure 5: Email Header Analyzer Workspace with Unfolded RFC 5322 Fields .................................... Page 19', marginX + 5, figBoxY + 37);
  doc.text('Figure 6: Drag-and-Drop .EML Ingestion Dialog and Parsing Interface ................................................. Page 20', marginX + 5, figBoxY + 43);

  addPageFooter(6, false);

  // ==========================================
  // PAGE 7: CONTENTS (PART 2 OF 2 - BALANCED 50/50 SPLIT!)
  // ==========================================
  doc.addPage();
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('CONTENTS (Continued)', pageWidth / 2, 28, { align: 'center' });

  let toc7Y = 40;
  // Chapter 4
  addTocLine('4 SYSTEM ANALYSIS AND DESIGN', '14', toc7Y, true); toc7Y += 5.5;
  addTocLine('4.1 Requirement analysis (Functional & Non-Functional)', '14', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('4.2 System architecture & forensic pipeline (Figure 1)', '15', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('4.3 Forensic data model & TypeScript contracts', '16', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('4.4 User interface design & cyber-defense color system', '16', toc7Y, false, 5); toc7Y += 5.5;

  // Chapter 5
  addTocLine('5 SPOOFSENTRY IMPLEMENTATION & SUBSYSTEMS', '16', toc7Y, true); toc7Y += 5.5;
  addTocLine('5.1 What is SpoofSentry?', '16', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('5.2 Modular project structure & file organization', '17', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('5.3 Real-time forensic dashboard', '17', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('5.4 Raw header & .EML file analyzer', '19', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('5.5 SPF, DKIM and DMARC authentication verifier', '21', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('5.6 MTA route & hop timing analyzer', '22', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('5.7 Screenshot OCR intake & Multimodal AI threat explainer', '23', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('5.8 Implementation highlights', '24', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('5.8.1 Header tokenization and RFC 5322 extraction', '25', toc7Y, false, 10); toc7Y += 4.8;
  addTocLine('5.8.2 DNS record parsing and alignment validation', '25', toc7Y, false, 10); toc7Y += 4.8;
  addTocLine('5.8.3 MTA hop transit delay & anomaly identification', '25', toc7Y, false, 10); toc7Y += 4.8;
  addTocLine('5.8.4 Heuristic scoring formula & risk calculation', '26', toc7Y, false, 10); toc7Y += 4.8;
  addTocLine('5.8.5 Threat notification and export facilities', '26', toc7Y, false, 10); toc7Y += 4.8;
  addTocLine('5.9 Testing, experimental results & test matrix (Table 2)', '27', toc7Y, false, 5); toc7Y += 5.5;

  // Chapter 6
  addTocLine('6 CONCLUSION AND FUTURE SCOPE', '28', toc7Y, true); toc7Y += 5.5;
  addTocLine('6.1 Conclusion & achievement of project goals', '28', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('6.2 Future scope & technical roadmap', '28', toc7Y, false, 5); toc7Y += 5.5;

  // References
  addTocLine('REFERENCES & RFC SPECIFICATIONS', '29', toc7Y, true); toc7Y += 5.5;

  // Appendices
  addTocLine('APPENDICES', '30', toc7Y, true); toc7Y += 5.5;
  addTocLine('Appendix 1. Core Header Parser Implementation (emailHeaderParser.ts)', '30', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('Appendix 2. Forensic Evaluation & DNS Engine Code (server.ts)', '33', toc7Y, false, 5); toc7Y += 4.8;
  addTocLine('Appendix 3. Cyber Threat UI & Forensic Styling Code (Tailwind / CSS)', '35', toc7Y, false, 5); toc7Y += 6.5;

  // Visual Figure Summary Box on Page 7 (Fills page perfectly!)
  const fig7BoxY = toc7Y + 2;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, fig7BoxY, contentWidth, 48, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  doc.text('LIST OF FIGURES (PART 2) & TABLES:', marginX + 5, fig7BoxY + 6);
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text('Figure 7: Domain Authentication Status Tiles for SPF, DKIM, and DMARC .................................... Page 21', marginX + 5, fig7BoxY + 12);
  doc.text('Figure 8: Authoritative DNS TXT Security Records Query Inspector .................................................. Page 22', marginX + 5, fig7BoxY + 18);
  doc.text('Figure 9: Chronological MTA Route Hop Path Reconstructed by SpoofSentry ............................... Page 22', marginX + 5, fig7BoxY + 24);
  doc.text('Figure 10: Inter-Hop Delay Graph Isolating Latency & Clock Drift Anomalies ................................ Page 23', marginX + 5, fig7BoxY + 30);
  doc.text('Figure 11: Multimodal AI Screenshot OCR Extraction & Threat Synthesis ...................................... Page 23', marginX + 5, fig7BoxY + 36);
  doc.text('Figure 12: Interactive Modal Dialog for Purging Local Forensic Audit Records ................................. Page 24', marginX + 5, fig7BoxY + 42);

  addPageFooter(7, false);
`;

console.log('[Script Builder] Writing part 1...');
fs.writeFileSync(path.join(__dirname, 'pdf_part1.txt'), content);
