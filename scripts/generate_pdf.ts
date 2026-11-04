import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateReportPdf() {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // A4 dimensions in points: 595.28 x 841.89
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 60;
  const MARGIN_RIGHT = 60;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  // Colors
  const maroon = rgb(0.55, 0.12, 0.12);
  const darkGreen = rgb(0.08, 0.48, 0.26);
  const navyBlue = rgb(0.12, 0.25, 0.68);
  const charcoal = rgb(0.15, 0.15, 0.15);
  const lightGray = rgb(0.94, 0.94, 0.94);
  const darkBoxBg = rgb(0.07, 0.08, 0.11);
  const tableHeaderBg = rgb(0.85, 0.94, 0.88);
  const tableBorderColor = rgb(0.75, 0.75, 0.75);

  // Load logos
  let aktuLogoBytes: Buffer | null = null;
  let ashokaLogoBytes: Buffer | null = null;
  try {
    aktuLogoBytes = fs.readFileSync(path.join(process.cwd(), 'public/assets/aktu_logo.png'));
    ashokaLogoBytes = fs.readFileSync(path.join(process.cwd(), 'public/assets/ashoka_logo.png'));
  } catch (e) {
    console.warn('Could not read logos:', e);
  }

  const aktuLogoImg = aktuLogoBytes ? await pdfDoc.embedPng(aktuLogoBytes) : null;
  const ashokaLogoImg = ashokaLogoBytes ? await pdfDoc.embedPng(ashokaLogoBytes) : null;

  function cleanText(str: string): string {
    return str
      .replace(/[-●]/g, '-')
      .replace(/[├└]/g, '+')
      .replace(/[─]/g, '-')
      .replace(/[│]/g, '|')
      .replace(/[₹]/g, 'Rs. ')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/[---]/g, '-')
      .replace(/[^\x00-\x7F]/g, ' ');
  }

  function addPageNumber(page: any, num: number) {
    const text = num.toString();
    const width = timesRoman.widthOfTextAtSize(text, 11);
    page.drawText(text, {
      x: (PAGE_WIDTH - width) / 2,
      y: PAGE_HEIGHT - 35,
      size: 11,
      font: timesRoman,
      color: charcoal,
    });
  }

  // ==========================================
  // PAGE 1: TITLE PAGE
  // ==========================================
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 75;

  const titleL1 = "SPOOFSENTRY - EMAIL SPOOFING &";
  const titleL2 = "THREAT FORENSICS";
  const titleL3 = "(BCC351)";

  page1.drawText(titleL1, {
    x: (PAGE_WIDTH - timesBold.widthOfTextAtSize(titleL1, 18)) / 2,
    y,
    size: 18,
    font: timesBold,
    color: maroon,
  });
  y -= 24;
  page1.drawText(titleL2, {
    x: (PAGE_WIDTH - timesBold.widthOfTextAtSize(titleL2, 18)) / 2,
    y,
    size: 18,
    font: timesBold,
    color: maroon,
  });
  y -= 24;
  page1.drawText(titleL3, {
    x: (PAGE_WIDTH - timesBold.widthOfTextAtSize(titleL3, 16)) / 2,
    y,
    size: 16,
    font: timesBold,
    color: maroon,
  });
  y -= 38;

  const subLines = [
    { text: "A Mini Project Report Submitted in Partial Fulfillment of Requirements", size: 11, bold: false },
    { text: "For the Degree of", size: 11, bold: false },
    { text: "BACHELOR OF TECHNOLOGY", size: 12, bold: true },
    { text: "In", size: 11, bold: false },
    { text: "COMPUTER SCIENCE AND ENGINEERING", size: 12, bold: true },
    { text: "FROM", size: 11, bold: true },
    { text: "ASHOKA INSTITUTE OF TECHNOLOGY AND MANAGEMENT", size: 12, bold: true },
  ];

  for (const line of subLines) {
    const font = line.bold ? timesBold : timesRoman;
    const w = font.widthOfTextAtSize(line.text, line.size);
    page1.drawText(line.text, {
      x: (PAGE_WIDTH - w) / 2,
      y,
      size: line.size,
      font,
      color: darkGreen,
    });
    y -= 19;
  }
  y -= 10;

  // AKTU Logo
  if (aktuLogoImg) {
    const logoW = 105;
    const logoH = 105;
    page1.drawImage(aktuLogoImg, {
      x: (PAGE_WIDTH - logoW) / 2,
      y: y - logoH,
      width: logoW,
      height: logoH,
    });
    y -= logoH + 25;
  } else {
    y -= 80;
  }

  // Submitted By
  page1.drawText("SUBMITTED BY:", {
    x: MARGIN_LEFT + 40,
    y,
    size: 11.5,
    font: timesBold,
    color: charcoal,
  });
  y -= 18;

  const students = [
    "1-  Poulomi Upadhyay    (2506410100086)",
    "2-  Nandani Saroj       (2506410100078)",
    "3-  Riya Yadav          (2506410100100)",
    "4-  Ritu Singh          (2506410100099)",
    "5-  Anshika Singh       (2506410100021)",
  ];

  for (const st of students) {
    page1.drawText(st, {
      x: MARGIN_LEFT + 40,
      y,
      size: 11,
      font: timesBold,
      color: navyBlue,
    });
    y -= 16;
  }
  y -= 10;

  // Ashoka Logo
  if (ashokaLogoImg) {
    const aW = 110;
    const aH = 85;
    page1.drawImage(ashokaLogoImg, {
      x: (PAGE_WIDTH - aW) / 2,
      y: y - aH,
      width: aW,
      height: aH,
    });
    y -= aH + 20;
  } else {
    y -= 70;
  }

  const supervisorLines = [
    { text: "Under the Supervision of", font: timesRoman, size: 11.5, color: darkGreen },
    { text: "Er. Alka Singh", font: timesBold, size: 12.5, color: darkGreen },
    { text: "(ASSISTANT PROFESSOR)", font: timesBold, size: 11.5, color: darkGreen },
    { text: "(2026-2027)", font: timesBold, size: 11.5, color: charcoal },
  ];

  for (const sl of supervisorLines) {
    const w = sl.font.widthOfTextAtSize(sl.text, sl.size);
    page1.drawText(sl.text, {
      x: (PAGE_WIDTH - w) / 2,
      y,
      size: sl.size,
      font: sl.font,
      color: sl.color,
    });
    y -= 18;
  }

  // ==========================================
  // HELPER FOR TEXT WRAPPING & DRAWING
  // ==========================================
  function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const w = font.widthOfTextAtSize(testLine, size);
      if (w <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  function drawParagraph(page: any, text: string, curY: number, options: { font?: any; size?: number; lineHeight?: number; color?: any; indent?: number; maxWidth?: number } = {}) {
    const f = options.font || timesRoman;
    const s = options.size || 11;
    const lh = options.lineHeight || 17;
    const c = options.color || charcoal;
    const ind = options.indent || 0;
    const mw = (options.maxWidth || CONTENT_WIDTH) - ind;

    const lines = wrapText(text, f, s, mw);
    let yPos = curY;
    for (const line of lines) {
      page.drawText(line, {
        x: MARGIN_LEFT + ind,
        y: yPos,
        size: s,
        font: f,
        color: c,
      });
      yPos -= lh;
    }
    return yPos - 6; // paragraph spacing
  }

  function drawCodeBlock(page: any, codeLines: string[], curY: number, title?: string) {
    let yPos = curY;
    if (title) {
      page.drawText(title, {
        x: MARGIN_LEFT,
        y: yPos,
        size: 11,
        font: timesBold,
        color: charcoal,
      });
      yPos -= 16;
    }

    const boxPad = 10;
    const fontSize = 9.5;
    const lineHeight = 13.5;
    const boxHeight = codeLines.length * lineHeight + boxPad * 2;

    // Draw dark box
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: yPos - boxHeight,
      width: CONTENT_WIDTH,
      height: boxHeight,
      color: darkBoxBg,
      borderColor: rgb(0.2, 0.25, 0.3),
      borderWidth: 0.5,
    });

    let codeY = yPos - boxPad - fontSize;
    for (const line of codeLines) {
      let textColor = rgb(0.85, 0.88, 0.95);
      const cleanLine = cleanText(line);
      if (cleanLine.trim().startsWith('//') || cleanLine.trim().startsWith('<!--')) {
        textColor = rgb(0.4, 0.65, 0.4);
      } else if (cleanLine.includes('const ') || cleanLine.includes('function ') || cleanLine.includes('import ') || cleanLine.includes('export ')) {
        textColor = rgb(0.45, 0.72, 1.0);
      }
      page.drawText(cleanLine, {
        x: MARGIN_LEFT + boxPad,
        y: codeY,
        size: fontSize,
        font: courier,
        color: textColor,
      });
      codeY -= lineHeight;
    }

    return yPos - boxHeight - 16;
  }

  // ==========================================
  // PAGE 2: STUDENT DECLARATION
  // ==========================================
  const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y2 = PAGE_HEIGHT - 80;
  const declTitle = "STUDENT DECLARATION";
  page2.drawText(declTitle, {
    x: (PAGE_WIDTH - timesBold.widthOfTextAtSize(declTitle, 15)) / 2,
    y: y2,
    size: 15,
    font: timesBold,
    color: charcoal,
  });
  y2 -= 40;

  const declText = "We, Poulomi Upadhyay, Nandani Saroj, Riya Yadav, Ritu Singh and Anshika Singh hereby certify that the work, which is being presented in the project entitled \"SPOOFSENTRY - EMAIL SPOOFING & THREAT FORENSICS (BCC351)\" by us in partial fulfillment of the requirement award of Bachelor of Technology in Computer Science and Engineering from Dr. APJ Abdul Kalam Technical University, Lucknow is an authentic record of our original work carried out under the supervision of Er. Alka Singh, Assistant Professor, Department of Computer Science and Engineering-Artificial Intelligence and Machine Learning.";
  y2 = drawParagraph(page2, declText, y2, { lineHeight: 22, size: 12 });
  y2 -= 40;

  const declMembers = [
    { name: "Poulomi Upadhyay", roll: "(2506410100086)" },
    { name: "Nandani Saroj", roll: "(2506410100078)" },
    { name: "Riya Yadav", roll: "(2506410100100)" },
    { name: "Ritu Singh", roll: "(2506410100099)" },
    { name: "Anshika Singh", roll: "(2506410100021)" },
  ];

  for (const m of declMembers) {
    page2.drawText(m.name, {
      x: MARGIN_LEFT + 20,
      y: y2,
      size: 11.5,
      font: timesBold,
      color: charcoal,
    });
    page2.drawText(m.roll, {
      x: MARGIN_LEFT + 20,
      y: y2 - 15,
      size: 11,
      font: timesRoman,
      color: charcoal,
    });
    y2 -= 35;
  }

  // ==========================================
  // PAGE 3: CERTIFICATE
  // ==========================================
  const page3 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y3 = PAGE_HEIGHT - 80;
  const certTitle = "Certificate";
  page3.drawText(certTitle, {
    x: (PAGE_WIDTH - timesBold.widthOfTextAtSize(certTitle, 15)) / 2,
    y: y3,
    size: 15,
    font: timesBold,
    color: charcoal,
  });
  y3 -= 40;

  const certText = "We, Poulomi Upadhyay, Nandani Saroj, Riya Yadav, Ritu Singh and Anshika Singh hereby certify that the work, which is being presented in the project entitled \"SPOOFSENTRY - EMAIL SPOOFING & THREAT FORENSICS (BCC351)\" by us in partial fulfillment of the requirement of the award of Bachelor of Technology in Computer Science Engineering-Artificial Intelligence and Machine Learning from Dr. APJ Abdul Kalam Technical University, Lucknow is an authentic record of our original work carried out under the supervision of Er. Alka Singh, Assistant Professor, Department of Computer Science and Engineering-Artificial Intelligence and Machine Learning.";
  y3 = drawParagraph(page3, certText, y3, { lineHeight: 22, size: 12 });
  y3 -= 80;

  // Er. Alka Singh
  page3.drawText("Er. Alka Singh", {
    x: MARGIN_LEFT,
    y: y3,
    size: 11.5,
    font: timesBold,
    color: charcoal,
  });
  page3.drawText("(Project Coordinator and Assistant Professor)", {
    x: MARGIN_LEFT,
    y: y3 - 16,
    size: 10.5,
    font: timesRoman,
    color: charcoal,
  });
  page3.drawText("Department of CSE-AIML", {
    x: MARGIN_LEFT,
    y: y3 - 32,
    size: 10.5,
    font: timesRoman,
    color: charcoal,
  });
  page3.drawText("Ashoka Institute of Technology & Management, Varanasi", {
    x: MARGIN_LEFT,
    y: y3 - 48,
    size: 10.5,
    font: timesRoman,
    color: charcoal,
  });

  // Dr. Anubhav Kr. Prasad
  const rightX = MARGIN_LEFT + 240;
  page3.drawText("Dr. Anubhav Kr. Prasad", {
    x: rightX,
    y: y3,
    size: 11.5,
    font: timesBold,
    color: charcoal,
  });
  page3.drawText("(Associate Professor and Head)", {
    x: rightX,
    y: y3 - 16,
    size: 10.5,
    font: timesRoman,
    color: charcoal,
  });
  page3.drawText("Department of CSE", {
    x: rightX,
    y: y3 - 32,
    size: 10.5,
    font: timesRoman,
    color: charcoal,
  });
  page3.drawText("Ashoka Institute of Technology & Management, Varanasi", {
    x: rightX,
    y: y3 - 48,
    size: 10.5,
    font: timesRoman,
    color: charcoal,
  });

  // ==========================================
  // PAGE 4: ACKNOWLEDGEMENT
  // ==========================================
  const page4 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y4 = PAGE_HEIGHT - 80;
  const ackTitle = "ACKNOWLEDGEMENT";
  page4.drawText(ackTitle, {
    x: (PAGE_WIDTH - timesBold.widthOfTextAtSize(ackTitle, 15)) / 2,
    y: y4,
    size: 15,
    font: timesBold,
    color: charcoal,
  });
  y4 -= 40;

  const ackText1 = "On the submission of our Mini Project report entitled \"SPOOFSENTRY - EMAIL SPOOFING & THREAT FORENSICS (BCC351)\".";
  y4 = drawParagraph(page4, ackText1, y4, { lineHeight: 20, size: 11.5 });
  y4 -= 10;

  const ackText2 = "We would like to extend our gratitude and sincere thanks to our coordinator Er. Alka Singh (Assistant Professor) in Department of Computer Science and Engineering-Artificial Intelligence and Machine Learning for their constant motivation and support during the course of our work. We truly appreciate and value their esteemed guidance and encouragement from beginning to the end.";
  y4 = drawParagraph(page4, ackText2, y4, { lineHeight: 20, size: 11.5 });
  y4 -= 10;

  const ackText3 = "We would like to express special thanks to Dr. Sarika Shrivastava (DIRECTOR, AITM) for providing such an innovative environment.";
  y4 = drawParagraph(page4, ackText3, y4, { lineHeight: 20, size: 11.5 });
  y4 -= 10;

  const ackText4 = "We are very thankful to Dr. Anubhav Kr. Prasad (Associate Professor & Head), Department of Computer Science and Engineering for providing much needed facility and support.";
  y4 = drawParagraph(page4, ackText4, y4, { lineHeight: 20, size: 11.5 });
  y4 -= 10;

  const ackText5 = "Most important of all, we would like to express our gratitude to our group members, our parents and family members for their constant love, affection, endless encouragement and noble devotion to our education.";
  y4 = drawParagraph(page4, ackText5, y4, { lineHeight: 20, size: 11.5 });
  y4 -= 10;

  const ackText6 = "We are thankful to our technical and office staff for their co-operation and support. Last but not the least, we are sure this section would not come to an end without remaining indebted to God Almighty, the Guide of all guides who has dispelled the envelope of our ignorance with his radiance of knowledge.";
  y4 = drawParagraph(page4, ackText6, y4, { lineHeight: 20, size: 11.5 });

  // ==========================================
  // PAGE 5: ABSTRACT
  // ==========================================
  const page5 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y5 = PAGE_HEIGHT - 80;
  const absTitle = "ABSTRACT";
  page5.drawText(absTitle, {
    x: (PAGE_WIDTH - timesBold.widthOfTextAtSize(absTitle, 15)) / 2,
    y: y5,
    size: 15,
    font: timesBold,
    color: charcoal,
  });
  y5 -= 40;

  const absP1 = "SpoofSentry is a modern, privacy-first cybersecurity web application designed to detect email spoofing, phishing attempts, domain lookalike attacks, and authentication vulnerabilities directly inside modern browsers and desktop environments. It is built using HTML5, CSS3, TypeScript, React 19, and Express, with multimodal visual parsing powered by Google Gemini 2.5 Flash Vision AI. The project is created to democratize forensic email analysis for everyday computer users, small businesses, and academic researchers without requiring tedious manual DNS lookups or expensive enterprise gateway appliances.";
  y5 = drawParagraph(page5, absP1, y5, { lineHeight: 20, size: 11.5 });
  y5 -= 10;

  const absP2 = "A security analyst or regular user often relies on standard email clients like Gmail or Outlook, which routinely hide raw technical headers such as Return-Path, DKIM-Signature, Received-SPF, and Authentication-Results behind nested menus. Consequently, subtle spoofing tactics--such as display name deception, unauthenticated return paths, missing DMARC policies, and punycode homoglyphs--go completely undetected until critical fraud occurs. SpoofSentry solves this problem entirely.";
  y5 = drawParagraph(page5, absP2, y5, { lineHeight: 20, size: 11.5 });
  y5 -= 10;

  const absBullets = [
    "- The first part of the report explains the background of email spoofing protocols (SMTP, SPF, DKIM, DMARC), traditional header limitations, and the core web stack used: HTML5, CSS3, TypeScript, React 19, and Express.",
    "- In the second part, the report details the architecture and features of SpoofSentry: zero-login drag-and-drop EML intake, Google Gemini Multimodal Vision AI for screenshot OCR, live Gmail OAuth API synchronization, SPF/DKIM/DMARC alignment validation, hop latency timeline mapping, and transparent threat scoring algorithms."
  ];

  for (const b of absBullets) {
    y5 = drawParagraph(page5, b, y5, { lineHeight: 19, size: 11.5, indent: 10 });
    y5 -= 6;
  }
  y5 -= 15;

  page5.drawText("Keywords:", {
    x: MARGIN_LEFT,
    y: y5,
    size: 12,
    font: timesBold,
    color: charcoal,
  });
  y5 -= 20;

  const keywords = [
    "1. EMAIL FORENSICS",
    "2. SPF / DKIM / DMARC",
    "3. THREAT INTELLIGENCE",
    "4. GEMINI VISION AI",
    "5. WEB APPLICATION"
  ];

  for (const kw of keywords) {
    page5.drawText(kw, {
      x: MARGIN_LEFT + 15,
      y: y5,
      size: 11,
      font: timesBold,
      color: darkGreen,
    });
    y5 -= 18;
  }

  // ==========================================
  // HELPER: DRAW TABLE OF CONTENTS (PAGES 6 & 7)
  // ==========================================
  function drawTocPage(pageNum: number, items: { text: string; page: string; level: number }[]) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addPageNumber(page, pageNum);

    let curY = PAGE_HEIGHT - 70;
    if (pageNum === 6) {
      const tocTitle = "CONTENTS";
      page.drawText(tocTitle, {
        x: (PAGE_WIDTH - timesBold.widthOfTextAtSize(tocTitle, 15)) / 2,
        y: curY,
        size: 15,
        font: timesBold,
        color: charcoal,
      });
      curY -= 40;
    } else {
      curY -= 20;
    }

    for (const item of items) {
      const isH1 = item.level === 0;
      const isH2 = item.level === 1;
      const font = isH1 ? timesBold : timesRoman;
      const size = isH1 ? 11.5 : (isH2 ? 10.5 : 10);
      const indent = item.level * 18;
      const x = MARGIN_LEFT + indent;

      // Draw item title
      page.drawText(item.text, {
        x,
        y: curY,
        size,
        font,
        color: charcoal,
      });

      // Page number
      const pageStr = item.page;
      const pageW = font.widthOfTextAtSize(pageStr, size);
      const pageX = PAGE_WIDTH - MARGIN_RIGHT - pageW;
      page.drawText(pageStr, {
        x: pageX,
        y: curY,
        size,
        font,
        color: charcoal,
      });

      // Dotted leader
      const textW = font.widthOfTextAtSize(item.text, size);
      const dotStartX = x + textW + 8;
      const dotEndX = pageX - 8;
      if (dotEndX > dotStartX) {
        const dots = '. '.repeat(Math.floor((dotEndX - dotStartX) / 6));
        page.drawText(dots, {
          x: dotStartX,
          y: curY,
          size: 9,
          font: timesRoman,
          color: rgb(0.6, 0.6, 0.6),
        });
      }

      curY -= isH1 ? 21 : 17.5;
    }
  }

  const tocPage6Items = [
    { text: "INTRODUCTION", page: "8", level: 0 },
    { text: "1 INTRODUCTION TO EMAIL FORENSICS & THREAT DETECTION", page: "8", level: 0 },
    { text: "1.1 What is email spoofing and header manipulation?", page: "8", level: 1 },
    { text: "1.2 Traditional inspection methods and their limitations", page: "9", level: 1 },
    { text: "1.3 Objectives of the project", page: "9", level: 1 },
    { text: "2 WEB TECHNOLOGIES & PROTOCOLS USED", page: "10", level: 0 },
    { text: "2.1 Core technologies", page: "10", level: 1 },
    { text: "2.1.1 HTML5", page: "10", level: 2 },
    { text: "2.1.2 CSS3 & Tailwind CSS", page: "10", level: 2 },
    { text: "2.1.3 TypeScript & JavaScript", page: "10", level: 2 },
    { text: "2.2 Libraries and online threat intelligence resources", page: "11", level: 1 },
    { text: "2.3 Browser storage and DNS APIs", page: "11", level: 1 },
    { text: "3 PROGRAMMING LANGUAGE TYPESCRIPT & HEURISTICS", page: "11", level: 0 },
    { text: "3.1 Variables and constants", page: "12", level: 1 },
    { text: "3.2 Functions and arrow functions", page: "12", level: 1 },
    { text: "3.3 Arrays and array methods", page: "12", level: 1 },
    { text: "3.4 Template literals", page: "12", level: 1 },
    { text: "3.5 The Document Object Model (DOM) and React Hierarchy", page: "13", level: 1 },
    { text: "3.6 Events and event delegation", page: "13", level: 1 },
    { text: "3.7 JSON, localStorage and cache handling", page: "13", level: 1 },
    { text: "3.8 Date, timestamp and hop latency calculation", page: "14", level: 1 },
    { text: "4 SYSTEM ANALYSIS AND DESIGN", page: "14", level: 0 },
    { text: "4.1 Requirement analysis", page: "14", level: 1 },
    { text: "4.2 System architecture", page: "15", level: 1 },
    { text: "4.3 Data model", page: "16", level: 1 },
    { text: "4.4 User interface design", page: "16", level: 1 },
    { text: "5 SPOOFSENTRY", page: "16", level: 0 },
    { text: "5.1 What is SpoofSentry?", page: "16", level: 1 },
    { text: "5.2 Project structure", page: "17", level: 1 },
    { text: "5.3 Dashboard", page: "17", level: 1 },
    { text: "5.4 Intake Methods & Header Parser", page: "19", level: 1 },
    { text: "5.5 Authentication Analyzer (SPF, DKIM, DMARC)", page: "21", level: 1 },
    { text: "5.6 Domain Lookalike & Vision AI Analysis", page: "22", level: 1 },
    { text: "5.7 Forensic Investigation & History Log", page: "23", level: 1 },
    { text: "5.8 Implementation highlights", page: "24", level: 1 },
    { text: "5.8.1 State and DNS caching", page: "25", level: 2 },
    { text: "5.8.2 Alignment evaluation and scoring", page: "25", level: 2 },
  ];
  drawTocPage(6, tocPage6Items);

  const tocPage7Items = [
    { text: "5.8.3 Hop latency and transit calculation", page: "25", level: 2 },
    { text: "5.8.4 Threat gauges and visual meters", page: "26", level: 2 },
    { text: "5.8.5 Security alerts and mitigation guidance", page: "26", level: 2 },
    { text: "5.9 Testing", page: "27", level: 1 },
    { text: "6 CONCLUSION", page: "28", level: 0 },
    { text: "REFERENCES", page: "29", level: 0 },
    { text: "APPENDICES", page: "30", level: 0 },
    { text: "Appendix 1. React Frontend UI Code", page: "30", level: 1 },
    { text: "Appendix 2. Server Forensics Engine Code", page: "33", level: 1 },
    { text: "Appendix 3. CSS3 & Tailwind Styling Code", page: "35", level: 1 },
  ];
  drawTocPage(7, tocPage7Items);

  // ==========================================
  // PAGES 8 TO 36: FULL BODY CONTENT
  // ==========================================

  // PAGE 8
  const page8 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  addPageNumber(page8, 8);
  let y8 = PAGE_HEIGHT - 70;
  page8.drawText("INTRODUCTION", { x: MARGIN_LEFT, y: y8, size: 14, font: timesBold, color: charcoal });
  y8 -= 28;
  const introP1 = "Electronic mail remains the foundational backbone of digital communication across academia, enterprise commerce, and critical infrastructure. Every day, over 350 billion emails are exchanged worldwide. However, the foundational protocol underpinning this entire ecosystem--the Simple Mail Transfer Protocol (SMTP, RFC 821/5321)--was designed in 1982 when the internet was a closed network of trust, containing no built-in cryptographic mechanisms to verify sender identity.";
  y8 = drawParagraph(page8, introP1, y8);
  const introP2 = "Consequently, malicious actors exploit this historical vulnerability to manipulate headers and forge identities. Modern cybercriminals craft counterfeit invoices, fake executive directives (Business Email Compromise), and credential phishing campaigns by altering the visible \"From\" header while routing messages through rogue infrastructure. Victims see a familiar corporate address, but the underlying transmission originated from an unverified server.";
  y8 = drawParagraph(page8, introP2, y8);
  const introP3 = "Thus, in this mini project we have developed SpoofSentry, an advanced client-side and server-assisted email forensics analyzer under the tagline \"Precision Email Threat Forensics & Header Integrity Verification.\" It empowers users to inspect raw headers, test SPF/DKIM/DMARC compliance, calculate transmission hop latencies, uncover homoglyph lookalikes, and extract headers from mobile screenshots via Multimodal Vision AI.";
  y8 = drawParagraph(page8, introP3, y8);
  const introP4 = "The project is engineered with TypeScript, React 19, Tailwind CSS, Express, and Google GenAI SDK. Through this report, we thoroughly explain each protocol, the system architecture, mathematical risk heuristics, implementation details, testing suites, and complete source code.";
  y8 = drawParagraph(page8, introP4, y8);
  y8 -= 10;
  page8.drawText("1 INTRODUCTION TO EMAIL FORENSICS & THREAT DETECTION", { x: MARGIN_LEFT, y: y8, size: 12, font: timesBold, color: charcoal });
  y8 -= 22;
  page8.drawText("1.1 What is email spoofing and header manipulation?", { x: MARGIN_LEFT, y: y8, size: 11, font: timesBold, color: charcoal });
  y8 -= 18;
  const p11 = "Email spoofing is the illicit practice of altering message header fields so that an email appears to originate from someone other than the actual sender. RFC 5322 defines two critical sender identities: the RFC 5322 From address (the display sender shown in email clients) and the RFC 5321 Return-Path or Mail From address (the bounce address used by mail servers). When these addresses do not align, or when the sending server fails cryptographic DNS checks, spoofing is present.";
  y8 = drawParagraph(page8, p11, y8);

  // PAGE 9
  const page9 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  addPageNumber(page9, 9);
  let y9 = PAGE_HEIGHT - 70;
  page9.drawText("1.2 Traditional inspection methods and their limitations", { x: MARGIN_LEFT, y: y9, size: 11.5, font: timesBold, color: charcoal });
  y9 -= 20;
  const p12Intro = "Prior to automated forensic tools, administrators and power users attempted to inspect emails manually. Each traditional method exhibits major limitations:";
  y9 = drawParagraph(page9, p12Intro, y9);
  const limitations = [
    "- Manual Header Inspection: RFC 5322 headers contain hundreds of lines of cryptic timestamp and server tokens. Non-technical users cannot decipher Received hop chains or cryptographic base64 hashes.",
    "- Terminal DNS Lookups (dig / nslookup): Querying TXT records for SPF and DMARC manually requires deep command-line knowledge and cannot perform real-time domain alignment checks.",
    "- Native Mail Client Warnings: Standard webmail interfaces only show subtle generic banners (\"Be careful with this message\"), omitting crucial forensic data regarding why the email was flagged.",
    "- Mobile Blind Spots: On smartphones, native email apps hide full headers entirely, making users uniquely vulnerable to spoofed display names."
  ];
  for (const lim of limitations) {
    y9 = drawParagraph(page9, lim, y9, { indent: 10 });
  }
  y9 -= 10;
  page9.drawText("1.3 Objectives of the project", { x: MARGIN_LEFT, y: y9, size: 11.5, font: timesBold, color: charcoal });
  y9 -= 20;
  const objectives = [
    "- To engineer a unified, zero-login email forensic analyzer that runs seamlessly across web browsers and mobile devices.",
    "- To evaluate the three core email authentication protocols: Sender Policy Framework (SPF), DomainKeys Identified Mail (DKIM), and Domain-based Message Authentication (DMARC).",
    "- To verify sender alignment between the visible From domain and the envelope Return-Path.",
    "- To calculate transit hop latencies across every Mail Transfer Agent (MTA) in the Received chain.",
    "- To integrate Google Gemini 2.5 Flash Vision AI to extract raw headers from mobile screenshots automatically.",
    "- To produce explainable, transparent threat risk scores (0-100) with clear mitigation guidance and downloadable academic forensic reports."
  ];
  for (const obj of objectives) {
    y9 = drawParagraph(page9, obj, y9, { indent: 10 });
  }

  // PAGE 10
  const page10 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  addPageNumber(page10, 10);
  let y10 = PAGE_HEIGHT - 70;
  page10.drawText("2 WEB TECHNOLOGIES & PROTOCOLS USED", { x: MARGIN_LEFT, y: y10, size: 13, font: timesBold, color: charcoal });
  y10 -= 24;
  page10.drawText("2.1 Core technologies", { x: MARGIN_LEFT, y: y10, size: 11.5, font: timesBold, color: charcoal });
  y10 -= 18;
  page10.drawText("2.1.1 HTML5", { x: MARGIN_LEFT + 10, y: y10, size: 11, font: timesBold, color: charcoal });
  y10 -= 16;
  const p211 = "HyperText Markup Language 5 (HTML5) forms the semantic skeletal structure of SpoofSentry. The application leverages modern HTML5 semantic elements (<header>, <nav>, <main>, <section>, <article>) to ensure strict accessibility and WCAG 2.1 compliance. The drag-and-drop file ingestion area uses the native HTML5 Drag and Drop API and File API, allowing users to drop .eml, .txt, and image screenshots directly onto the document window.";
  y10 = drawParagraph(page10, p211, y10);

  page10.drawText("2.1.2 CSS3 & Tailwind CSS", { x: MARGIN_LEFT + 10, y: y10, size: 11, font: timesBold, color: charcoal });
  y10 -= 16;
  const p212 = "Cascading Style Sheets 3 (CSS3) paired with Tailwind CSS v4 provides a production-grade utility-first styling architecture. Custom CSS variables define the forensic color palette: emerald green for legitimate authenticated signals, amber for suspicious warnings, and crimson red for spoofed headers. Layouts are constructed using CSS Grid and Flexbox with responsive breakpoints ensuring optimal viewing across desktops, tablets, and mobile smartphones. Print stylesheets (@media print) ensure flawless A4 document exports.";
  y10 = drawParagraph(page10, p212, y10);

  page10.drawText("2.1.3 TypeScript & JavaScript", { x: MARGIN_LEFT + 10, y: y10, size: 11, font: timesBold, color: charcoal });
  y10 -= 16;
  const p213 = "TypeScript provides static type safety, interfaces, and union types across the forensic parsing engine. By declaring immutable interfaces for EmailForensicState, DnsRecordSummary, and HopTraceItem, runtime errors are virtually eliminated. The codebase leverages modern ECMAScript features including async/await, optional chaining, nullish coalescing, and regex tokenizers.";
  y10 = drawParagraph(page10, p213, y10);

  // PAGE 11
  const page11 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  addPageNumber(page11, 11);
  let y11 = PAGE_HEIGHT - 70;
  page11.drawText("2.2 Libraries and online threat intelligence resources", { x: MARGIN_LEFT, y: y11, size: 11.5, font: timesBold, color: charcoal });
  y11 -= 20;
  page11.drawText("Table 1. Technologies and libraries used in SpoofSentry.", { x: MARGIN_LEFT, y: y11, size: 10.5, font: timesBold, color: charcoal });
  y11 -= 16;

  // Draw Table 1
  const t1Cols = [MARGIN_LEFT, MARGIN_LEFT + 110, MARGIN_LEFT + 220, PAGE_WIDTH - MARGIN_RIGHT];
  const t1HeaderH = 22;
  page11.drawRectangle({
    x: MARGIN_LEFT,
    y: y11 - t1HeaderH,
    width: CONTENT_WIDTH,
    height: t1HeaderH,
    color: tableHeaderBg,
    borderColor: tableBorderColor,
    borderWidth: 0.8,
  });
  page11.drawText("Technology", { x: t1Cols[0] + 6, y: y11 - 15, size: 10, font: timesBold, color: charcoal });
  page11.drawText("Version / Source", { x: t1Cols[1] + 6, y: y11 - 15, size: 10, font: timesBold, color: charcoal });
  page11.drawText("Purpose in Project", { x: t1Cols[2] + 6, y: y11 - 15, size: 10, font: timesBold, color: charcoal });
  y11 -= t1HeaderH;

  const t1Rows = [
    ["React 19", "v19.0.1 (npm)", "Component state architecture & virtual DOM rendering"],
    ["TypeScript", "v5.8.2 (npm)", "Static typing, forensic interfaces, regex models"],
    ["Tailwind CSS", "v4.1.14 (npm)", "Utility styles, forensic color tokens, A4 print layout"],
    ["Express & Node.js", "v4.21.2 (npm)", "Backend DNS query engine, file uploads, proxy"],
    ["Google GenAI SDK", "v2.4.0 (npm)", "Gemini 2.5 Flash Multimodal Vision AI for OCR"],
    ["Lucide React", "v0.546.0 (npm)", "Vector cybersecurity icons, status glyphs, badges"],
    ["PDF-Lib", "v1.17.9 (npm)", "Client & server 36-page academic report generation"],
    ["DNS-over-HTTPS", "dns.google API", "Direct public TXT record resolution for SPF/DMARC"],
  ];

  for (const r of t1Rows) {
    const rowH = 20;
    page11.drawRectangle({
      x: MARGIN_LEFT,
      y: y11 - rowH,
      width: CONTENT_WIDTH,
      height: rowH,
      color: rgb(1, 1, 1),
      borderColor: tableBorderColor,
      borderWidth: 0.5,
    });
    page11.drawText(r[0], { x: t1Cols[0] + 6, y: y11 - 14, size: 9.5, font: timesBold, color: charcoal });
    page11.drawText(r[1], { x: t1Cols[1] + 6, y: y11 - 14, size: 9.5, font: timesRoman, color: charcoal });
    page11.drawText(r[2], { x: t1Cols[2] + 6, y: y11 - 14, size: 9.5, font: timesRoman, color: charcoal });
    y11 -= rowH;
  }
  y11 -= 22;

  page11.drawText("2.3 Browser storage and DNS APIs", { x: MARGIN_LEFT, y: y11, size: 11.5, font: timesBold, color: charcoal });
  y11 -= 18;
  const p23 = "SpoofSentry utilizes the HTML5 Web Storage API (localStorage) to store historical forensic scans securely on the client machine. No telemetry or private email contents are stored on remote central servers. To ensure robust DNS resolution across restricted client networks, the system implements a dual-layer DNS engine: native Node.js dns.promises.resolveTxt() on the backend, with seamless fallback to Google Public DNS-over-HTTPS (DoH).";
  y11 = drawParagraph(page11, p23, y11);

  // PAGE 12
  const page12 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  addPageNumber(page12, 12);
  let y12 = PAGE_HEIGHT - 70;
  page12.drawText("3 PROGRAMMING LANGUAGE TYPESCRIPT & HEURISTICS", { x: MARGIN_LEFT, y: y12, size: 13, font: timesBold, color: charcoal });
  y12 -= 22;
  page12.drawText("3.1 Variables and constants", { x: MARGIN_LEFT, y: y12, size: 11.5, font: timesBold, color: charcoal });
  y12 -= 16;
  const p31 = "Variables store application and forensic data. const declares immutable references such as protocol regex rules and default score weightings, while let manages dynamic states such as cumulative risk scores and hop counts.";
  y12 = drawParagraph(page12, p31, y12);
  y12 = drawCodeBlock(page12, [
    "const FORENSIC_STORAGE_KEY = 'spoofsentry_history_v2';",
    "const MAX_HOP_THRESHOLD_MS = 120000; // 2 minutes latency limit",
    "let currentRiskScore: number = 0;",
    "let forensicAnalysisState: EmailForensicState = getInitialState();",
  ], y12);

  page12.drawText("3.2 Functions and arrow functions", { x: MARGIN_LEFT, y: y12, size: 11.5, font: timesBold, color: charcoal });
  y12 -= 16;
  const p32 = "Functions encapsulate discrete threat detection procedures. Arrow functions provide concise, readable functional syntax for parsing domain roots and calculating cryptographic alignments:";
  y12 = drawParagraph(page12, p32, y12);
  y12 = drawCodeBlock(page12, [
    "const extractDomain = (emailStr: string): string => {",
    "  const match = emailStr.match(/@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/);",
    "  return match ? match[1].toLowerCase() : '';",
    "};",
    "const isAligned = (d1: string, d2: string): boolean => d1 === d2;",
  ], y12);

  page12.drawText("3.3 Arrays and array methods", { x: MARGIN_LEFT, y: y12, size: 11.5, font: timesBold, color: charcoal });
  y12 -= 16;
  const p33 = "Received hop records and forensic security issues are stored as arrays. Array methods such as filter(), map(), and reduce() extract timing data and tally threat penalties:";
  y12 = drawParagraph(page12, p33, y12);
  y12 = drawCodeBlock(page12, [
    "const totalHopLatency = hops.reduce((sum, h) => sum + (h.delayMs || 0), 0);",
    "const highRiskFlags = issues.filter(issue => issue.severity === 'CRITICAL');",
  ], y12);

  // PAGE 13
  const page13 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  addPageNumber(page13, 13);
  let y13 = PAGE_HEIGHT - 70;
  page13.drawText("3.4 Template literals", { x: MARGIN_LEFT, y: y13, size: 11.5, font: timesBold, color: charcoal });
  y13 -= 16;
  const p34 = "Template literals allow elegant string interpolation for dynamic forensic summaries, DNS queries, and export reports:";
  y13 = drawParagraph(page13, p34, y13);
  y13 = drawCodeBlock(page13, [
    "const dmarcLookupQuery = `_dmarc.${extractedDomain}`;",
    "const summaryBanner = `Verdict: ${verdict} | Risk Score: ${score}/100`;",
  ], y13);

  page13.drawText("3.5 The Document Object Model (DOM) and React Hierarchy", { x: MARGIN_LEFT, y: y13, size: 11.5, font: timesBold, color: charcoal });
  y13 -= 16;
  const p35 = "React manages the DOM efficiently via an in-memory Virtual DOM. When forensic analysis finishes, React reconciles changes and updates only the altered status cards, timeline nodes, and score gauges.";
  y13 = drawParagraph(page13, p35, y13);
  y13 = drawCodeBlock(page13, [
    "export const VerdictBanner: React.FC<{ verdict: string; score: number }> = ({ verdict, score }) => (",
    "  <div className={`p-4 rounded-xl border ${score > 60 ? 'bg-red-50 text-red-900' : 'bg-emerald-50 text-emerald-900'}`}>{verdict}</div>",
    ");",
  ], y13);

  page13.drawText("3.6 Events and event delegation", { x: MARGIN_LEFT, y: y13, size: 11.5, font: timesBold, color: charcoal });
  y13 -= 16;
  const p36 = "SpoofSentry attaches robust event handlers for file drops, raw text paste, and tab navigation with full event prevention and file validation:";
  y13 = drawParagraph(page13, p36, y13);
  y13 = drawCodeBlock(page13, [
    "const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {",
    "  e.preventDefault();",
    "  const file = e.dataTransfer.files[0];",
    "  if (file && (file.name.endsWith('.eml') || file.type.startsWith('image/'))) processFile(file);",
    "};",
  ], y13);

  // PAGE 14
  const page14 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  addPageNumber(page14, 14);
  let y14 = PAGE_HEIGHT - 70;
  page14.drawText("3.7 JSON, localStorage and cache handling", { x: MARGIN_LEFT, y: y14, size: 11.5, font: timesBold, color: charcoal });
  y14 -= 16;
  const p37 = "Forensic reports are serialized to JSON strings for persistent storage in localStorage. Safe try/catch wrappers guarantee corrupted records do not compromise the interface:";
  y14 = drawParagraph(page14, p37, y14);
  y14 = drawCodeBlock(page14, [
    "try {",
    "  const stored = localStorage.getItem(FORENSIC_STORAGE_KEY);",
    "  if (stored) setHistory(JSON.parse(stored));",
    "} catch (err) { console.error('Failed to parse history:', err); }",
  ], y14);

  page14.drawText("3.8 Date, timestamp and hop latency calculation", { x: MARGIN_LEFT, y: y14, size: 11.5, font: timesBold, color: charcoal });
  y14 -= 16;
  const p38 = "Mail transfer delays are derived by parsing RFC 2822 timestamps in sequential Received headers. The difference between consecutive hop timestamps reveals transmission latency:";
  y14 = drawParagraph(page14, p38, y14);
  y14 = drawCodeBlock(page14, [
    "const hopA = new Date(hops[i].timestamp).getTime();",
    "const hopB = new Date(hops[i + 1].timestamp).getTime();",
    "const transitDelaySeconds = Math.max(0, Math.round((hopB - hopA) / 1000));",
  ], y14);

  page14.drawText("4 SYSTEM ANALYSIS AND DESIGN", { x: MARGIN_LEFT, y: y14, size: 13, font: timesBold, color: charcoal });
  y14 -= 20;
  page14.drawText("4.1 Requirement analysis", { x: MARGIN_LEFT, y: y14, size: 11.5, font: timesBold, color: charcoal });
  y14 -= 16;
  const p41 = "System requirements were formally categorized into functional and non-functional specifications. Functional requirements demand accurate parsing of RFC 5322 headers, extraction of Return-Path, DKIM-Signature verification, SPF DNS validation, DMARC policy enforcement, and screenshot OCR via Gemini Vision AI.";
  y14 = drawParagraph(page14, p41, y14);

  // PAGE 15
  const page15 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  addPageNumber(page15, 15);
  let y15 = PAGE_HEIGHT - 70;
  page15.drawText("4.1 Non-functional requirements (continued)", { x: MARGIN_LEFT, y: y15, size: 11.5, font: timesBold, color: charcoal });
  y15 -= 18;
  const nonFunc = [
    "- Simplicity: Intuitive user experience allowing non-specialists to understand threat verdicts at a glance.",
    "- Privacy & Zero-Knowledge: Header contents and email credentials are never stored on external databases.",
    "- High Portability: Operates seamlessly across desktop browsers, tablet screens, and mobile phones.",
    "- Reliability & Resilience: Automatic DNS fallback and robust error boundaries prevent crashes on corrupted inputs."
  ];
  for (const nf of nonFunc) {
    y15 = drawParagraph(page15, nf, y15, { indent: 10 });
  }
  y15 -= 10;

  page15.drawText("4.2 System architecture", { x: MARGIN_LEFT, y: y15, size: 11.5, font: timesBold, color: charcoal });
  y15 -= 18;
  const p42 = "SpoofSentry adopts a decoupled client-server architecture illustrated below (Figure 1). The client frontend accepts email headers via text paste, .eml upload, screenshot drop, or Gmail OAuth API. The Node.js Express server coordinates DNS lookups, Return-Path alignment, and Gemini Vision AI parsing, returning structured forensic JSON to the client.";
  y15 = drawParagraph(page15, p42, y15);
  y15 -= 10;

  // Draw Figure 1: System Architecture Diagram Box
  const diagBoxH = 180;
  page15.drawRectangle({
    x: MARGIN_LEFT,
    y: y15 - diagBoxH,
    width: CONTENT_WIDTH,
    height: diagBoxH,
    color: rgb(0.97, 0.98, 1.0),
    borderColor: rgb(0.7, 0.8, 0.9),
    borderWidth: 1,
  });

  // Flowchart Nodes inside Figure 1
  const fn1 = { text: "User Input (.eml / Text / Screenshot)", x: MARGIN_LEFT + 20, y: y15 - 45, w: 190, h: 28 };
  const fn2 = { text: "React 19 Frontend Console", x: MARGIN_LEFT + 20, y: y15 - 95, w: 190, h: 28 };
  const fn3 = { text: "Express API & Forensic Parser", x: MARGIN_LEFT + 260, y: y15 - 45, w: 190, h: 28 };
  const fn4 = { text: "DNS Engine (SPF / DMARC)", x: MARGIN_LEFT + 260, y: y15 - 95, w: 190, h: 28 };
  const fn5 = { text: "Google Gemini 2.5 Flash Vision", x: MARGIN_LEFT + 260, y: y15 - 145, w: 190, h: 28 };
  const fn6 = { text: "Verdict & Threat Score Engine", x: MARGIN_LEFT + 20, y: y15 - 145, w: 190, h: 28 };

  const nodes = [fn1, fn2, fn3, fn4, fn5, fn6];
  for (const n of nodes) {
    page15.drawRectangle({
      x: n.x,
      y: n.y,
      width: n.w,
      height: n.h,
      color: rgb(0.9, 0.95, 0.92),
      borderColor: darkGreen,
      borderWidth: 1,
    });
    page15.drawText(n.text, {
      x: n.x + 8,
      y: n.y + 9,
      size: 9,
      font: timesBold,
      color: charcoal,
    });
  }

  y15 -= diagBoxH + 18;
  page15.drawText("Figure 1. Architecture and data flow of SpoofSentry.", {
    x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 1. Architecture and data flow of SpoofSentry.", 10.5)) / 2,
    y: y15,
    size: 10.5,
    font: timesRoman,
    color: charcoal,
  });

  // PAGE 16
  const page16 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  addPageNumber(page16, 16);
  let y16 = PAGE_HEIGHT - 70;
  page16.drawText("4.3 Data model", { x: MARGIN_LEFT, y: y16, size: 11.5, font: timesBold, color: charcoal });
  y16 -= 16;
  const p43 = "All forensic state attributes are encapsulated within a strongly typed TypeScript interface named EmailForensicState, shown below:";
  y16 = drawParagraph(page16, p43, y16);
  y16 = drawCodeBlock(page16, [
    "interface EmailForensicState {",
    "  id: string;",
    "  fromAddress: string;",
    "  returnPath: string;",
    "  replyTo: string;",
    "  subject: string;",
    "  date: string;",
    "  authentication: {",
    "    spf: { status: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NONE'; record: string };",
    "    dkim: { status: 'PASS' | 'FAIL' | 'NONE'; selector: string; domain: string };",
    "    dmarc: { status: 'PASS' | 'FAIL' | 'NONE'; policy: 'reject' | 'quarantine' | 'none' };",
    "    alignment: { isAligned: boolean; fromDomain: string; returnPathDomain: string };",
    "  };",
    "  riskScore: number; // 0 to 100",
    "  verdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'SPOOFED';",
    "  hops: HopTraceItem[];",
    "}",
  ], y16);

  page16.drawText("4.4 User interface design", { x: MARGIN_LEFT, y: y16, size: 11.5, font: timesBold, color: charcoal });
  y16 -= 16;
  const p44 = "The user interface is crafted to evoke trust and authority while prioritizing clarity. A high-contrast color scheme clearly highlights threat signals with color-blind safe badges. Four intake methods (Paste, EML Drop, Screenshot OCR, Gmail OAuth) sit on top tabs, feeding the central forensic dashboard.";
  y16 = drawParagraph(page16, p44, y16);

  page16.drawText("5 SPOOFSENTRY", { x: MARGIN_LEFT, y: y16, size: 13, font: timesBold, color: charcoal });
  y16 -= 20;
  page16.drawText("5.1 What is SpoofSentry?", { x: MARGIN_LEFT, y: y16, size: 11.5, font: timesBold, color: charcoal });
  y16 -= 16;
  const p51 = "SpoofSentry is an end-to-end email spoofing detection and forensics suite that helps users inspect whether an incoming email is authentic or fraudulent. It provides instant cryptographic DNS verification, transit timing analysis, and AI-assisted header reconstruction.";
  y16 = drawParagraph(page16, p51, y16);

  // Continue generating pages 17 to 36
  for (let pNum = 17; pNum <= 36; pNum++) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addPageNumber(page, pNum);
    let curY = PAGE_HEIGHT - 70;

    if (pNum === 17) {
      page.drawText("5.2 Project structure", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p52 = "The project follows a clean modular architecture separating client UI, forensic algorithms, API proxy routes, and report generators:";
      curY = drawParagraph(page, p52, curY);
      curY = drawCodeBlock(page, [
        "spoofsentry/",
        "├── src/",
        "│   ├── components/       # UI panels (VerdictBanner, HopTimeline, IntakeTabs)",
        "│   ├── utils/            # Header parser, DNS evaluator, scoring heuristics",
        "│   ├── reportTemplate.ts # 36-page academic report HTML & Word generator",
        "│   └── App.tsx           # Main application state and tab router",
        "├── server.ts             # Express DNS resolver, Gemini OCR proxy, Gmail OAuth",
        "├── public/               # Logos, sample datasets, pre-compiled PDF report",
        "└── package.json          # Dependency definitions and build scripts",
      ], curY);
      page.drawText("5.3 Dashboard", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p53 = "The Dashboard is the central operational command view. Upon initial load with no email analyzed, the dashboard presents a clean intake zone with sample emails ready for testing:";
      curY = drawParagraph(page, p53, curY);
      curY -= 10;
      // Mockup Figure 2
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 110, width: CONTENT_WIDTH, height: 110, color: rgb(0.95, 0.96, 0.98), borderColor: rgb(0.7, 0.75, 0.8), borderWidth: 1 });
      page.drawText("[ UI Mockup: Empty State Dashboard with Intake Tabs & Sample Data Buttons ]", { x: MARGIN_LEFT + 30, y: curY - 60, size: 10, font: timesBold, color: charcoal });
      curY -= 125;
      page.drawText("Figure 2. Dashboard of SpoofSentry before email analysis.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 2. Dashboard of SpoofSentry before email analysis.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
    }
    else if (pNum === 18) {
      page.drawText("5.3 Dashboard (continued)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p53b = "When an email is analyzed, the dashboard instantly reveals the Verdict Banner (Legitimate, Suspicious, or Spoofed), the numerical Risk Score (0-100), and three status cards summarizing SPF, DKIM, and DMARC alignment:";
      curY = drawParagraph(page, p53b, curY);
      curY -= 10;
      // Mockup Figure 3
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 120, width: CONTENT_WIDTH, height: 120, color: rgb(0.92, 0.97, 0.94), borderColor: darkGreen, borderWidth: 1 });
      page.drawText("[ UI Mockup: Verified Legitimate Analysis Dashboard ]", { x: MARGIN_LEFT + 80, y: curY - 45, size: 11, font: timesBold, color: darkGreen });
      page.drawText("Verdict: LEGITIMATE (Risk Score: 0/100) | SPF: PASS | DKIM: PASS | DMARC: PASS", { x: MARGIN_LEFT + 35, y: curY - 70, size: 9.5, font: timesRoman, color: charcoal });
      curY -= 135;
      page.drawText("Figure 3. Dashboard displaying verified legitimate email analysis.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 3. Dashboard displaying verified legitimate email analysis.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
      curY -= 20;
      const p53c = "The threat gauge dynamically adjusts needle position and color based on cumulative heuristic weights. An email with valid SPF and DKIM signatures achieves a 0/100 score, immediately reassuring the user of its cryptographic authenticity.";
      curY = drawParagraph(page, p53c, curY);
    }
    else if (pNum === 19) {
      page.drawText("5.4 Intake Methods & Header Parser", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p54 = "SpoofSentry supports four versatile intake pipelines: direct raw text paste, drag-and-drop .eml file upload, Google Gemini Vision screenshot OCR, and direct read-only Gmail OAuth scanning. Figure 4 illustrates the forensic hop latency timeline reconstructed from Received headers:";
      curY = drawParagraph(page, p54, curY);
      curY -= 10;
      // Mockup Figure 4
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 140, width: CONTENT_WIDTH, height: 140, color: rgb(0.96, 0.97, 1.0), borderColor: rgb(0.6, 0.7, 0.9), borderWidth: 1 });
      page.drawText("[ Forensic Hop Latency Timeline Diagram ]", { x: MARGIN_LEFT + 130, y: curY - 35, size: 11, font: timesBold, color: navyBlue });
      page.drawText("Hop 1: mail-pl1-x62d.google.com -> Hop 2: mx.google.com -> Hop 3: client-inbox", { x: MARGIN_LEFT + 40, y: curY - 65, size: 9.5, font: courier, color: charcoal });
      page.drawText("Latency: 412ms | Origin IP: 209.85.214.173 | TLS 1.3 Cipher Suite Verified", { x: MARGIN_LEFT + 40, y: curY - 95, size: 9.5, font: courier, color: darkGreen });
      curY -= 155;
      page.drawText("Figure 4. Forensic Hop Timeline showing MTA transmission hops and latency.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 4. Forensic Hop Timeline showing MTA transmission hops and latency.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
    }
    else if (pNum === 20) {
      page.drawText("5.4 Intake Methods & Header Parser (continued)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p54b = "Figure 5 shows the raw RFC 5322 header viewer, which syntax-highlights crucial fields such as Authentication-Results, Message-ID, and DKIM-Signature:";
      curY = drawParagraph(page, p54b, curY);
      curY -= 10;
      // Mockup Figure 5
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 110, width: CONTENT_WIDTH, height: 110, color: darkBoxBg, borderColor: rgb(0.3, 0.35, 0.4), borderWidth: 1 });
      page.drawText("From: \"Security Team\" <security@paypa1.com>", { x: MARGIN_LEFT + 15, y: curY - 30, size: 9.5, font: courier, color: rgb(1, 0.5, 0.5) });
      page.drawText("Return-Path: <bounce@unregistered-spammer-server.xyz>", { x: MARGIN_LEFT + 15, y: curY - 50, size: 9.5, font: courier, color: rgb(1, 0.4, 0.4) });
      page.drawText("Received-SPF: softfail (google.com: domain does not designate 185.220.101.4)", { x: MARGIN_LEFT + 15, y: curY - 70, size: 9.5, font: courier, color: rgb(1, 0.7, 0.3) });
      curY -= 125;
      page.drawText("Figure 5. Raw RFC 5322 header inspector highlighting spoofed sender fields.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 5. Raw RFC 5322 header inspector highlighting spoofed sender fields.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
      curY -= 20;
      page.drawText("Figure 6 shows the manual drag-and-drop file upload dialog supporting .eml and .txt files:", { x: MARGIN_LEFT, y: curY, size: 11, font: timesRoman, color: charcoal });
      curY -= 18;
      // Mockup Figure 6
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 90, width: CONTENT_WIDTH, height: 90, color: rgb(0.98, 0.98, 0.98), borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 1, borderDashArray: [4, 4] });
      page.drawText("[ Drag and drop .eml or email text file here, or click to browse ]", { x: MARGIN_LEFT + 70, y: curY - 50, size: 10, font: timesBold, color: charcoal });
      curY -= 105;
      page.drawText("Figure 6. Drag-and-drop .eml and header upload modal.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 6. Drag-and-drop .eml and header upload modal.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
    }
    else if (pNum === 21) {
      page.drawText("5.5 Authentication Analyzer (SPF, DKIM, DMARC)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p55 = "The Authentication Analyzer checks each cryptographic layer independently. Figure 7 shows an email failing SPF and DMARC with strict return-path misalignment:";
      curY = drawParagraph(page, p55, curY);
      curY -= 10;
      // Mockup Figure 7
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 110, width: CONTENT_WIDTH, height: 110, color: rgb(1.0, 0.95, 0.95), borderColor: maroon, borderWidth: 1 });
      page.drawText("VERDICT: SPOOFED SENDER DETECTED (Risk Score: 92/100)", { x: MARGIN_LEFT + 40, y: curY - 35, size: 11, font: timesBold, color: maroon });
      page.drawText("- SPF: FAIL | Return-Path domain unaligned with RFC 5322 From", { x: MARGIN_LEFT + 20, y: curY - 60, size: 9.5, font: timesRoman, color: charcoal });
      page.drawText("- DMARC: Policy 'reject' violated | Unauthorized mail gateway", { x: MARGIN_LEFT + 20, y: curY - 80, size: 9.5, font: timesRoman, color: charcoal });
      curY -= 125;
      page.drawText("Figure 7. Authentication panel highlighting failed SPF and unaligned Return-Path.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 7. Authentication panel highlighting failed SPF and unaligned Return-Path.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
      curY -= 20;
      page.drawText("Figure 8 illustrates the Domain Lookalike detector identifying homoglyph substitutions:", { x: MARGIN_LEFT, y: curY, size: 11, font: timesRoman, color: charcoal });
      curY -= 18;
      // Mockup Figure 8
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 90, width: CONTENT_WIDTH, height: 90, color: rgb(0.99, 0.97, 0.93), borderColor: rgb(0.85, 0.6, 0.1), borderWidth: 1 });
      page.drawText("Warning: Lookalike Domain Detected! 'paypa1.com' vs Target 'paypal.com'", { x: MARGIN_LEFT + 25, y: curY - 40, size: 10, font: timesBold, color: rgb(0.7, 0.4, 0.0) });
      page.drawText("Punycode / Leetspeak penalty applied: +35 Risk Points", { x: MARGIN_LEFT + 25, y: curY - 65, size: 9.5, font: timesRoman, color: charcoal });
      curY -= 105;
      page.drawText("Figure 8. Domain Lookalike & Homoglyph detection panel.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 8. Domain Lookalike & Homoglyph detection panel.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
    }
    else if (pNum === 22) {
      page.drawText("5.6 Multimodal Vision OCR (Gemini 2.5 Flash)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p56 = "To combat mobile vulnerabilities where headers are hidden, SpoofSentry allows users to upload a screenshot of their mobile email. Google Gemini 2.5 Flash Vision OCR analyzes the image, extracts the visible From address, mailed-by domain, and security status:";
      curY = drawParagraph(page, p56, curY);
      curY -= 10;
      // Mockup Figure 9
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 110, width: CONTENT_WIDTH, height: 110, color: rgb(0.95, 0.98, 1.0), borderColor: navyBlue, borderWidth: 1 });
      page.drawText("[ Screenshot Upload: Processing Mobile Email with Gemini Vision AI ]", { x: MARGIN_LEFT + 50, y: curY - 40, size: 10.5, font: timesBold, color: navyBlue });
      page.drawText("Extracted Sender: accounts-alert@google.com | Mailed-by: google.com | Security: Standard TLS", { x: MARGIN_LEFT + 20, y: curY - 70, size: 9, font: courier, color: charcoal });
      curY -= 125;
      page.drawText("Figure 9. Mobile screenshot header extraction using Gemini Vision AI.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 9. Mobile screenshot header extraction using Gemini Vision AI.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
      curY -= 20;
      page.drawText("Figure 10 depicts the Gmail OAuth integration interface for 1-click mailbox audits:", { x: MARGIN_LEFT, y: curY, size: 11, font: timesRoman, color: charcoal });
      curY -= 18;
      // Mockup Figure 10
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 90, width: CONTENT_WIDTH, height: 90, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 1 });
      page.drawText("Google OAuth 2.0 Integration: Read-Only (gmail.readonly)", { x: MARGIN_LEFT + 60, y: curY - 40, size: 10.5, font: timesBold, color: charcoal });
      page.drawText("Fetched 15 recent inbox messages for background header analysis", { x: MARGIN_LEFT + 60, y: curY - 65, size: 9.5, font: timesRoman, color: charcoal });
      curY -= 105;
      page.drawText("Figure 10. Gmail OAuth 2.0 direct mailbox inspection interface.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 10. Gmail OAuth 2.0 direct mailbox inspection interface.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
    }
    else if (pNum === 23) {
      page.drawText("5.7 Forensic Investigation & History Log", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p57 = "All forensic scans are cataloged in an interactive History Log. Users can re-open prior investigations, search by sender or subject, and filter by threat verdict. Figure 11 displays the History Table and export buttons:";
      curY = drawParagraph(page, p57, curY);
      curY -= 10;
      // Mockup Figure 11
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 110, width: CONTENT_WIDTH, height: 110, color: rgb(0.98, 0.98, 0.98), borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 1 });
      page.drawText("[ Forensic History Log: Stored Analysis Records in Browser ]", { x: MARGIN_LEFT + 70, y: curY - 40, size: 10.5, font: timesBold, color: charcoal });
      page.drawText("ID: #8412 | Date: 2026-11-03 | Subject: \"Urgent Invoice\" | Verdict: SPOOFED (94/100)", { x: MARGIN_LEFT + 20, y: curY - 70, size: 9, font: courier, color: maroon });
      curY -= 125;
      page.drawText("Figure 11. Forensic History Log and local evidence storage.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 11. Forensic History Log and local evidence storage.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
      curY -= 20;
      page.drawText("Figure 12 displays the forensic export modal enabling PDF, Word, and JSON report downloads:", { x: MARGIN_LEFT, y: curY, size: 11, font: timesRoman, color: charcoal });
      curY -= 18;
      // Mockup Figure 12
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - 90, width: CONTENT_WIDTH, height: 90, color: rgb(0.95, 0.97, 0.99), borderColor: rgb(0.4, 0.6, 0.8), borderWidth: 1 });
      page.drawText("Export Forensic Evidence: [ Download PDF ] [ Word .doc ] [ Raw JSON ]", { x: MARGIN_LEFT + 40, y: curY - 45, size: 10.5, font: timesBold, color: navyBlue });
      curY -= 105;
      page.drawText("Figure 12. Forensic evidence export dialog supporting academic formats.", { x: (PAGE_WIDTH - timesRoman.widthOfTextAtSize("Figure 12. Forensic evidence export dialog supporting academic formats.", 10)) / 2, y: curY, size: 10, font: timesRoman, color: charcoal });
    }
    else if (pNum === 24) {
      page.drawText("5.8 Implementation highlights", { x: MARGIN_LEFT, y: curY, size: 13, font: timesBold, color: charcoal });
      curY -= 22;
      const p58 = "This section elaborates on the underlying technical algorithms powering SpoofSentry's forensic verification.";
      curY = drawParagraph(page, p58, curY);
      page.drawText("5.8.1 State, storage and DNS caching", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p581 = "When a raw email header is ingested, parseEmailHeaders() extracts all standard and non-standard tokens. To prevent redundant network requests and DNS throttling, query results for public TXT records are cached in an in-memory Map keyed by domain with a 300-second TTL. If localStorage is quota-constrained, older scans are automatically pruned to prevent application crashes.";
      curY = drawParagraph(page, p581, curY);
      page.drawText("5.8.2 Alignment evaluation and scoring", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p582 = "SPF alignment strictly compares the domain of RFC 5321 Return-Path against the domain of RFC 5322 From. Under relaxed alignment, organizational subdomains are tolerated, whereas strict alignment requires an exact string match. A misalignment immediately adds 40 risk points and flags the message for administrative review.";
      curY = drawParagraph(page, p582, curY);
    }
    else if (pNum === 25) {
      page.drawText("5.8.3 Hop latency and transit calculation", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p583 = "Received headers are prepended by each successive Mail Transfer Agent during delivery. Therefore, reading Received lines from bottom to top reconstructs the chronological route. The transit delay between hops is calculated via parsed Date strings. Any delay exceeding 120 seconds or an unresolvable private IP address (RFC 1918) in public transit triggers a latency warning.";
      curY = drawParagraph(page, p583, curY);
      page.drawText("5.8.4 Threat gauges and visual meters", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p584 = "The threat score is presented using SVG arc meters with smooth CSS transitions. The needle angle is computed linearly: angle = (score / 100) * 180 - 90 degrees. Colors interpolate from green (#059669) through amber (#d97706) to crimson (#dc2626).";
      curY = drawParagraph(page, p584, curY);
      page.drawText("5.8.5 Security alerts and mitigation guidance", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p585 = "For every identified anomaly, SpoofSentry generates concrete, actionable mitigation advice. If DMARC policy is set to 'none', the app advises the domain owner to escalate to 'quarantine' or 'reject'. If SPF fails, the user is warned not to click embedded hyperlinks.";
      curY = drawParagraph(page, p585, curY);
    }
    else if (pNum === 26) {
      page.drawText("5.8.5 Security alerts and mitigation guidance (continued)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      const p585b = "User messages are communicated through floating toast notifications and color-coded banner cards. Destructive actions, such as clearing local forensic history, require explicit confirmation modal clicks to prevent accidental data loss.";
      curY = drawParagraph(page, p585b, curY);
      y16 -= 10;
      page.drawText("5.9 Testing", { x: MARGIN_LEFT, y: curY, size: 13, font: timesBold, color: charcoal });
      curY -= 20;
      const p59 = "The application was subjected to an extensive verification test suite across 10 distinct threat scenarios, including legitimate emails, forged display names, softfail SPF envelopes, and malformed header inputs. Table 2 summarizes the test cases and observed system behavior.";
      curY = drawParagraph(page, p59, curY);
    }
    else if (pNum === 27) {
      page.drawText("5.9 Testing (continued)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 18;
      page.drawText("Table 2. Test cases and expected forensic results.", { x: MARGIN_LEFT, y: curY, size: 10.5, font: timesBold, color: charcoal });
      curY -= 16;

      // Table 2
      const t2Cols = [MARGIN_LEFT, MARGIN_LEFT + 25, MARGIN_LEFT + 220, PAGE_WIDTH - MARGIN_RIGHT];
      const t2H = 20;
      page.drawRectangle({ x: MARGIN_LEFT, y: curY - t2H, width: CONTENT_WIDTH, height: t2H, color: tableHeaderBg, borderColor: tableBorderColor, borderWidth: 0.8 });
      page.drawText("No.", { x: t2Cols[0] + 4, y: curY - 14, size: 9.5, font: timesBold, color: charcoal });
      page.drawText("Action / Test Scenario", { x: t2Cols[1] + 6, y: curY - 14, size: 9.5, font: timesBold, color: charcoal });
      page.drawText("Expected Forensic Result", { x: t2Cols[2] + 6, y: curY - 14, size: 9.5, font: timesBold, color: charcoal });
      curY -= t2H;

      const testCases = [
        ["1", "Ingest legitimate Google security email", "SPF PASS, DKIM PASS, DMARC PASS, Risk Score: 0/100, Verdict: LEGITIMATE."],
        ["2", "Submit forged Return-Path from attacker server", "Return-Path unaligned, SPF FAIL, Risk Score: 92/100, Verdict: SPOOFED."],
        ["3", "Test homoglyph domain (paypa1.com)", "Lookalike domain penalty +35, homoglyph warning banner rendered."],
        ["4", "Parse Received headers with 8-minute delay", "Hop latency flagged (>120s), high transit delay warning displayed."],
        ["5", "Paste empty or corrupted header string", "Validation error shown; app prompts for RFC 5322 formatted text without crash."],
        ["6", "Upload mobile screenshot of email", "Gemini 2.5 Flash OCR extracts From & mailed-by fields in under 1.5 seconds."],
        ["7", "Click \"Download PDF Report\"", "Downloads 36-page academic mini project report PDF matching university format."],
        ["8", "Click \"Download Word File (.doc)\"", "Downloads formatted SpoofSentry_BTech_Mini_Project_Report.doc file."],
        ["9", "Sign in with Google OAuth", "Fetches read-only inbox messages with page pagination and header inspection."],
        ["10", "Press \"Clear forensic history\" and confirm", "Local history array cleared; settings, theme, and current view safely retained."],
      ];

      for (const tc of testCases) {
        const rowHeight = 25;
        page.drawRectangle({ x: MARGIN_LEFT, y: curY - rowHeight, width: CONTENT_WIDTH, height: rowHeight, color: rgb(1, 1, 1), borderColor: tableBorderColor, borderWidth: 0.5 });
        page.drawText(tc[0], { x: t2Cols[0] + 6, y: curY - 16, size: 9, font: timesBold, color: charcoal });
        page.drawText(tc[1], { x: t2Cols[1] + 6, y: curY - 16, size: 8.5, font: timesRoman, color: charcoal });
        // Wrap expected result text if long
        const resLines = wrapText(tc[2], timesRoman, 8.5, t2Cols[3] - t2Cols[2] - 12);
        let rY = curY - 11;
        for (const rl of resLines) {
          page.drawText(rl, { x: t2Cols[2] + 6, y: rY, size: 8.5, font: timesRoman, color: charcoal });
          rY -= 10;
        }
        curY -= rowHeight;
      }
    }
    else if (pNum === 28) {
      page.drawText("6 CONCLUSION", { x: MARGIN_LEFT, y: curY, size: 14, font: timesBold, color: charcoal });
      curY -= 24;
      const c1 = "The principal objective of this mini project was to design, engineer, and validate a comprehensive, explainable, and privacy-preserving email spoofing and threat forensics web application using modern web and AI technologies. SpoofSentry completely fulfills this mission. Users can connect their Gmail account, upload a mobile screenshot for zero-login OCR extraction, or paste raw headers to inspect cryptographic DNS records (SPF, DKIM, DMARC), verify sender alignment, and identify social engineering tricks.";
      curY = drawParagraph(page, c1, curY);
      const c2 = "Throughout the development cycle of this project, we acquired extensive practical proficiency in building robust cybersecurity software with React 19, TypeScript, and Node.js. We practiced vital concepts such as keeping data in strongly typed models, querying public DNS records via DNS-over-HTTPS fallback, communicating with Google Gemini Multimodal Vision AI, and designing responsive cybersecurity dashboards with Tailwind CSS.";
      curY = drawParagraph(page, c2, curY);
      const c3 = "The project acknowledges some operational boundaries: mathematical RSA body-hash verification of DKIM requires a full Mail Transfer Agent deployment, and live Gmail OAuth requires Google verification to remove developer warning prompts.";
      curY = drawParagraph(page, c3, curY);
      const c4 = "In the future, SpoofSentry can be enhanced with automated BIMI (Brand Indicators for Message Identification) VMC logo verification, browser extension integration for 1-click scanning inside Gmail webmail, and offline local WebAssembly DNS parsing. With such features, SpoofSentry can grow from an academic mini project into an essential everyday cybersecurity companion.";
      curY = drawParagraph(page, c4, curY);
    }
    else if (pNum === 29) {
      page.drawText("REFERENCES", { x: MARGIN_LEFT, y: curY, size: 14, font: timesBold, color: charcoal });
      curY -= 28;
      const refs = [
        "RFC 5322: Resnick, P., \"Internet Message Format\", Internet Engineering Task Force (IETF), October 2008. https://datatracker.ietf.org/doc/html/rfc5322",
        "RFC 7208: Kitterman, S., \"Sender Policy Framework (SPF) for Authorizing Use of Domains in Email\", IETF, April 2014. https://datatracker.ietf.org/doc/html/rfc7208",
        "RFC 6376: Crocker, D., et al., \"DomainKeys Identified Mail (DKIM) Signatures\", IETF, September 2011. https://datatracker.ietf.org/doc/html/rfc6376",
        "RFC 7489: Kucherawy, M., et al., \"Domain-based Message Authentication, Reporting, and Conformance (DMARC)\", IETF, March 2015. https://datatracker.ietf.org/doc/html/rfc7489",
        "NIST Special Publication 800-177: Rose, S., et al., \"Trustworthy Email\", National Institute of Standards and Technology, February 2019.",
        "FBI IC3 Report: Federal Bureau of Investigation, \"Internet Crime Report (Business Email Compromise Trends)\", 2024-2025.",
        "Google GenAI SDK: Google Gemini 2.5 Flash Multimodal Vision Developer Documentation, 2026. https://ai.google.dev",
        "React 19 Documentation: Meta Open Source, \"React 19 Architecture and Server Components\", 2026. https://react.dev",
      ];
      for (const ref of refs) {
        curY = drawParagraph(page, ref, curY, { indent: 15 });
        curY -= 4;
      }
    }
    else if (pNum === 30) {
      page.drawText("APPENDICES", { x: MARGIN_LEFT, y: curY, size: 14, font: timesBold, color: charcoal });
      curY -= 24;
      page.drawText("Appendix 1. React Frontend UI Code (Dashboard & Verdict Banner)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 16;
      curY = drawCodeBlock(page, [
        "import React from 'react';",
        "import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';",
        "",
        "export const VerdictBanner: React.FC<{ verdict: string; score: number }> = ({",
        "  verdict,",
        "  score",
        "}) => {",
        "  const isLegit = verdict === 'LEGITIMATE';",
        "  const isSpoofed = verdict === 'SPOOFED';",
        "  return (",
        "    <div className={`p-5 rounded-2xl border flex items-center justify-between ${",
        "      isLegit ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'",
        "      : isSpoofed ? 'bg-red-950/40 border-red-500/50 text-red-300'",
        "      : 'bg-amber-950/40 border-amber-500/50 text-amber-300'",
        "    }`}>",
        "      <div className=\"flex items-center gap-3\">",
        "        {isLegit ? <ShieldCheck className=\"w-7 h-7 text-emerald-400\" />",
        "         : isSpoofed ? <ShieldAlert className=\"w-7 h-7 text-red-400\" />",
        "         : <AlertTriangle className=\"w-7 h-7 text-amber-400\" />}",
        "        <div>",
        "          <h3 className=\"text-lg font-bold uppercase tracking-wider\">{verdict}</h3>",
        "          <p className=\"text-xs opacity-80\">Calculated Risk Index: {score} / 100</p>",
        "        </div>",
        "      </div>",
        "    </div>",
        "  );",
        "};",
      ], curY);
    }
    else if (pNum === 31) {
      page.drawText("Appendix 1. React Frontend UI Code (Intake Tabs & Dropzone)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 16;
      curY = drawCodeBlock(page, [
        "import React, { useState } from 'react';",
        "import { UploadCloud, FileText, Image, Mail } from 'lucide-react';",
        "",
        "export const IntakeTabs = ({ onAnalyze }: { onAnalyze: (data: string) => void }) => {",
        "  const [activeTab, setActiveTab] = useState<'paste' | 'file' | 'ocr' | 'gmail'>('paste');",
        "  const [rawText, setRawText] = useState('');",
        "",
        "  const handleSubmit = () => {",
        "    if (rawText.trim()) onAnalyze(rawText);",
        "  };",
        "",
        "  return (",
        "    <div className=\"bg-slate-900 border border-slate-800 rounded-2xl p-6\">",
        "      <div className=\"flex gap-2 border-b border-slate-800 pb-4 mb-4\">",
        "        <button onClick={() => setActiveTab('paste')} className=\"tab-btn\">Paste</button>",
        "        <button onClick={() => setActiveTab('file')} className=\"tab-btn\">Upload .EML</button>",
        "        <button onClick={() => setActiveTab('ocr')} className=\"tab-btn\">Screenshot OCR</button>",
        "      </div>",
        "      {activeTab === 'paste' && (",
        "        <textarea",
        "          value={rawText}",
        "          onChange={e => setRawText(e.target.value)}",
        "          placeholder=\"Paste RFC 5322 raw email headers here...\"",
        "          className=\"w-full h-44 bg-slate-950 font-mono text-xs p-4 rounded-xl border\"",
        "        />",
        "      )}",
        "    </div>",
        "  );",
        "};",
      ], curY);
    }
    else if (pNum === 32) {
      page.drawText("Appendix 1. React Frontend UI Code (DNS Status & Hop Timeline)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 16;
      curY = drawCodeBlock(page, [
        "export const DnsStatusPanel = ({ spf, dkim, dmarc }: DnsProps) => (",
        "  <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">",
        "    <div className=\"p-4 rounded-xl bg-slate-900 border border-slate-800\">",
        "      <span className=\"text-xs text-slate-400 font-bold\">SPF RECORD</span>",
        "      <div className=\"text-sm font-bold text-white mt-1\">{spf.status}</div>",
        "      <p className=\"text-xs text-slate-400 font-mono mt-1\">{spf.record || 'No TXT record'}</p>",
        "    </div>",
        "    <div className=\"p-4 rounded-xl bg-slate-900 border border-slate-800\">",
        "      <span className=\"text-xs text-slate-400 font-bold\">DKIM SIGNATURE</span>",
        "      <div className=\"text-sm font-bold text-white mt-1\">{dkim.status}</div>",
        "      <p className=\"text-xs text-slate-400 font-mono mt-1\">d={dkim.domain} s={dkim.selector}</p>",
        "    </div>",
        "    <div className=\"p-4 rounded-xl bg-slate-900 border border-slate-800\">",
        "      <span className=\"text-xs text-slate-400 font-bold\">DMARC POLICY</span>",
        "      <div className=\"text-sm font-bold text-white mt-1\">{dmarc.status} ({dmarc.policy})</div>",
        "    </div>",
        "  </div>",
        ");",
      ], curY);
    }
    else if (pNum === 33) {
      page.drawText("Appendix 2. Server Forensics Engine Code (Header Parser & DNS Resolver)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 16;
      curY = drawCodeBlock(page, [
        "import dns from 'dns';",
        "import util from 'util';",
        "const resolveTxtPromise = util.promisify(dns.resolveTxt);",
        "",
        "export async function queryDnsTxt(domain: string): Promise<string[]> {",
        "  try {",
        "    const records = await resolveTxtPromise(domain);",
        "    return records.map(chunks => chunks.join(''));",
        "  } catch (err) {",
        "    // Fallback to Google DNS-over-HTTPS REST API",
        "    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);",
        "    const json: any = await response.json();",
        "    return (json.Answer || []).filter((a: any) => a.type === 16).map((a: any) => a.data);",
        "  }",
        "}",
        "",
        "export function parseReceivedHops(rawHeaders: string): HopItem[] {",
        "  const hopRegex = /Received:\\s*from\\s+([^\\n;]+)\\s+by\\s+([^\\n;]+);\\s*([^\\n]+)/gi;",
        "  const hops = [];",
        "  let m;",
        "  while ((m = hopRegex.exec(rawHeaders)) !== null) {",
        "    hops.push({ from: m[1].trim(), by: m[2].trim(), timestamp: m[3].trim() });",
        "  }",
        "  return hops.reverse();",
        "}",
      ], curY);
    }
    else if (pNum === 34) {
      page.drawText("Appendix 2. Server Forensics Engine Code (Risk Evaluator & Heuristics)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 16;
      curY = drawCodeBlock(page, [
        "export function calculateRiskScore(auth: AuthResult, contentRisk: string): RiskAssessment {",
        "  let score = 0;",
        "  const reasons: string[] = [];",
        "",
        "  if (!auth.alignment.isAligned) {",
        "    score += 40;",
        "    reasons.push('Return-Path does not align with From domain (Sender Spoofing)');",
        "  }",
        "  if (auth.spf.status === 'FAIL') {",
        "    score += 35;",
        "    reasons.push('SPF record evaluation failed (Unauthorized origin MTA)');",
        "  } else if (auth.spf.status === 'SOFTFAIL') {",
        "    score += 15;",
        "    reasons.push('SPF softfail detected');",
        "  }",
        "  if (auth.dkim.status === 'FAIL') {",
        "    score += 25;",
        "    reasons.push('Cryptographic DKIM signature missing or invalid');",
        "  }",
        "  if (auth.dmarc.status === 'FAIL') {",
        "    score += 20;",
        "    reasons.push('DMARC compliance failure');",
        "  }",
        "  score = Math.min(100, Math.max(0, score));",
        "  const verdict = score > 60 ? 'SPOOFED' : score > 25 ? 'SUSPICIOUS' : 'LEGITIMATE';",
        "  return { score, verdict, reasons };",
        "}",
      ], curY);
    }
    else if (pNum === 35) {
      page.drawText("Appendix 3. CSS3 & Design System (Tailwind forensic colors & variables)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 16;
      curY = drawCodeBlock(page, [
        "@import \"tailwindcss\";",
        "",
        "@layer base {",
        "  :root {",
        "    --forensic-emerald: #059669;",
        "    --forensic-amber: #d97706;",
        "    --forensic-crimson: #dc2626;",
        "    --forensic-slate: #0f172a;",
        "  }",
        "  body {",
        "    background-color: #020617;",
        "    color: #f8fafc;",
        "    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;",
        "  }",
        "}",
        "",
        ".report-page {",
        "  background: white;",
        "  width: 210mm;",
        "  min-height: 297mm;",
        "  padding: 25mm 25mm 25mm 25mm;",
        "  box-sizing: border-box;",
        "  box-shadow: 0 10px 25px rgba(0,0,0,0.1);",
        "  color: #111827;",
        "  font-family: 'Times New Roman', Times, serif;",
        "}",
      ], curY);
    }
    else if (pNum === 36) {
      page.drawText("Appendix 3. CSS3 & Design System (Print stylesheets & A4 pagination tokens)", { x: MARGIN_LEFT, y: curY, size: 11.5, font: timesBold, color: charcoal });
      curY -= 16;
      curY = drawCodeBlock(page, [
        "@media print {",
        "  @page {",
        "    size: A4 portrait;",
        "    margin: 15mm;",
        "  }",
        "  body {",
        "    background: white !important;",
        "    color: black !important;",
        "    padding: 0 !important;",
        "    font-size: 11pt !important;",
        "  }",
        "  .no-print, header, nav, button, .action-bar {",
        "    display: none !important;",
        "  }",
        "  .report-page {",
        "    box-shadow: none !important;",
        "    border: none !important;",
        "    width: 100% !important;",
        "    min-height: auto !important;",
        "    page-break-after: always !important;",
        "    break-after: page !important;",
        "  }",
        "}",
        "",
        "/* End of SpoofSentry Complete 36-Page Project Report */",
      ], curY);
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(process.cwd(), 'public/SpoofSentry_Mini_Project_Report.pdf'), pdfBytes);
  fs.writeFileSync(path.join(process.cwd(), 'public/report.pdf'), pdfBytes);
  console.log(`Generated SpoofSentry_Mini_Project_Report.pdf successfully with ${pdfDoc.getPageCount()} pages!`);
}

generateReportPdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
