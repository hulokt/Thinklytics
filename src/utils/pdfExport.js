import jsPDF from 'jspdf';
import logoImage from "/logo.png";

// Text sanitization helper to fix encoding issues and convert symbols to text
const sanitizeText = (text) => {
  if (!text) return '';
  return String(text)
    // Mathematical symbols to text conversions
    .replace(/π/g, 'pi')
    .replace(/∏/g, 'PI') // Capital pi (product)
    .replace(/∑/g, 'sigma') // Summation
    .replace(/∆/g, 'delta') // Delta (change)
    .replace(/δ/g, 'delta') // Lowercase delta
    .replace(/θ/g, 'theta') // Theta
    .replace(/Θ/g, 'THETA') // Capital theta
    .replace(/α/g, 'alpha') // Alpha
    .replace(/β/g, 'beta') // Beta
    .replace(/γ/g, 'gamma') // Gamma
    .replace(/λ/g, 'lambda') // Lambda
    .replace(/μ/g, 'mu') // Mu
    .replace(/σ/g, 'sigma') // Sigma
    .replace(/φ/g, 'phi') // Phi
    .replace(/ω/g, 'omega') // Omega
    .replace(/Ω/g, 'OMEGA') // Capital omega
    .replace(/∞/g, 'infinity')
    .replace(/√/g, 'sqrt')
    .replace(/∫/g, 'integral')
    .replace(/∂/g, 'partial')
    .replace(/≈/g, 'approximately')
    .replace(/≠/g, 'not equal')
    .replace(/≤/g, 'less than or equal')
    .replace(/≥/g, 'greater than or equal')
    .replace(/±/g, 'plus or minus')
    .replace(/∓/g, 'minus or plus')
    .replace(/×/g, 'x') // Multiplication sign
    .replace(/÷/g, '/') // Division sign
    .replace(/°/g, ' degrees')
    .replace(/²/g, '^2') // Superscript 2
    .replace(/³/g, '^3') // Superscript 3
    .replace(/¼/g, '1/4')
    .replace(/½/g, '1/2')
    .replace(/¾/g, '3/4')
    .replace(/⅓/g, '1/3')
    .replace(/⅔/g, '2/3')
    .replace(/⅛/g, '1/8')
    .replace(/⅜/g, '3/8')
    .replace(/⅝/g, '5/8')
    .replace(/⅞/g, '7/8')
    .replace(/∈/g, 'in') // Element of
    .replace(/∉/g, 'not in') // Not element of
    .replace(/⊂/g, 'subset of')
    .replace(/⊆/g, 'subset or equal')
    .replace(/∪/g, 'union')
    .replace(/∩/g, 'intersection')
    .replace(/∅/g, 'empty set')
    // Currency symbols
    .replace(/€/g, 'EUR')
    .replace(/£/g, 'GBP')
    .replace(/¥/g, 'YEN')
    .replace(/¢/g, 'cents')
    // Other common symbols
    .replace(/§/g, 'section')
    .replace(/¶/g, 'paragraph')
    .replace(/©/g, '(c)')
    .replace(/®/g, '(R)')
    .replace(/™/g, '(TM)')
    // Smart quotes and dashes (keep these)
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    // After symbol conversion, remove any remaining non-ASCII characters
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
};

// Helper: Async image loader that resolves to an Image element
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const exportQuestionsAsPDF = async (exportableQuestions, filename = 'Thinklytics_SAT_Questions') => {
  if (exportableQuestions.length === 0) {
    alert('No questions to export!');
    return;
  }

  try {
    // --- PAGE & LAYOUT CONSTANTS ---
    const inch = 25.4;
    const pageWidth = 8.5 * inch;
    const pageHeight = 11 * inch;
    const marginX = 0.6 * inch;
    const marginY = 1 * inch;
    const gutter = 0.6 * inch;
    const colWidth = 3.4 * inch;
    const contentWidth = pageWidth - 2 * marginX;
    const contentHeight = pageHeight - 2 * marginY;
    const questionBoxSize = 0.18 * inch; // slightly smaller
    const grayBarHeight = questionBoxSize;
    const dividerX = marginX + colWidth + gutter / 2;
    const answerIndent = 0.25 * inch;
    const questionSpacing = 0.5 * inch;
    const directionsBoxPadY = 0.25 * inch;
    const directionsBoxPadX = 0.5 * inch;

    // --- FONTS & COLORS ---
    const COLORS = {
      black: '#000000',
      white: '#FFFFFF',
      blue: '#2563eb',
      indigo: '#4f46e5',
      gray: '#d1d5db',
      grayLight: '#e5e7eb',
      grayBar: '#d1d5db',
      text: '#111827',
      subtitleBorder: '#60a5fa',
      underline: '#1e3a8a',
      directionsBox: '#000',
      directionsText: '#fff',
      divider: '#d1d5db',
      code: '#6b7280',
    };
    // Use only built-in jsPDF fonts for reliability
    const FONTS = {
      primary: 'helvetica',
      secondary: 'helvetica',
      heading: 'helvetica',
      body: 'helvetica',
    };

    // --- PDF INIT ---
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidth, pageHeight],
    });
    let page = 1;

    // --- COVER PAGE ---
    pdf.setFillColor(COLORS.white);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top-left Thinklytics logo
    try {
      const logoImg = await loadImage(logoImage);
      pdf.addImage(logoImg, 'PNG', marginX, marginY - 4, 16, 16); // back to smaller logo
    } catch {}

    // Top-right barcode placeholder (simple thick lines)
    const bcX = pageWidth - marginX - 20;
    const bcY = marginY - 4;
    pdf.setFillColor(COLORS.black);
    for (let i = 0; i < 10; i++) {
      const w = (i % 2 === 0) ? 1 : 0.6;
      pdf.rect(bcX + i * 1.5, bcY, w, 16, 'F');
    }

    // Main title – smaller fonts for cover page
    const titleY = marginY + 30;
    pdf.setFont(FONTS.heading, 'bold');
    pdf.setFontSize(42); // much smaller title
    pdf.setTextColor(COLORS.text);
    pdf.text(sanitizeText('Thinklytics'), marginX, titleY);

    // Blue underline
    pdf.setDrawColor(COLORS.blue);
    pdf.setLineWidth(1.5);
    pdf.line(marginX, titleY + 2, marginX + 70, titleY + 2);

    // Practice Test line - smaller fonts
    pdf.setFontSize(32); // smaller subtitle
    pdf.text(sanitizeText('Practice'), marginX, titleY + 22);
    pdf.text(sanitizeText('Test'), marginX, titleY + 40);

    // Simple geometric shape
    pdf.setFillColor(COLORS.blue);
    pdf.circle(marginX + 80, titleY + 25, 6, 'F'); // smaller circle
    pdf.setFillColor(COLORS.white);
    pdf.circle(marginX + 80, titleY + 25, 4, 'F');

    // Start benefit sections below Practice Test text
    let currentY = titleY + 55;

    const drawSectionHeader = (title) => {
      pdf.setFont(FONTS.heading, 'bold');
      pdf.setFontSize(12); // smaller header
      pdf.setTextColor(COLORS.blue);
      pdf.text(sanitizeText(title), marginX, currentY);
      currentY += 5;
      pdf.setDrawColor(COLORS.blue);
      pdf.setLineWidth(0.8);
      pdf.line(marginX, currentY, marginX + 80, currentY);
      currentY += 7;
      pdf.setFont(FONTS.body, 'normal');
      pdf.setFontSize(9); // smaller body text
      pdf.setTextColor(COLORS.text);
    };

    const drawBullets = (lines) => {
      const bulletFontSize = 9; // smaller bullets
      const lineHeight = bulletFontSize * 0.3528 * 1.15;
      pdf.setFontSize(bulletFontSize);
      lines.forEach(line => {
        const sanitizedLine = sanitizeText(line);
        const wrapped = pdf.splitTextToSize(`• ${sanitizedLine}`, contentWidth - 8);
        pdf.text(wrapped, marginX + 4, currentY, { maxWidth: contentWidth - 8, lineHeightFactor: 1.15 });
        currentY += wrapped.length * lineHeight + 1;
      });
      currentY += 2;
    };

    // Why Practice Tests Work
    drawSectionHeader('Why Practice Tests Work');
    drawBullets([
      'Flexible Practice – work on your own schedule with adaptive tests.',
      'Focused Improvement – target weak areas with customized sets.',
      'Real Test Experience – simulate official timing & interface.'
    ]);

    // How Practice Tests Help You Succeed – Preparation
    drawSectionHeader('How Practice Tests Help You Succeed');
    pdf.setFont(FONTS.body, 'bold');
    pdf.setFontSize(9);
    pdf.text(sanitizeText('For Test Preparation'), marginX + 2, currentY);
    currentY += 6;
    pdf.setFont(FONTS.body, 'normal');
    drawBullets([
      'Build familiarity with SAT formats and timing',
      'Identify and address knowledge gaps',
      'Develop efficient test-taking strategies',
      'Improve time-management skills',
      'Boost confidence through repetition'
    ]);

    // Performance tracking
    pdf.setFont(FONTS.body, 'bold');
    pdf.setFontSize(9);
    pdf.text(sanitizeText('For Performance Tracking'), marginX + 2, currentY);
    currentY += 6;
    pdf.setFont(FONTS.body, 'normal');
    drawBullets([
      'Monitor improvement across sections',
      'Track progress on specific question types',
      'Identify recurring error patterns',
      'Set and achieve score goals',
      'Generate detailed reports for applications'
    ]);

    // How to Use Practice Tests Effectively
    drawSectionHeader('How to Use Practice Tests Effectively');
    const steps = [
      'Create Your Test - choose questions by topic & difficulty.',
      'Take Your Time - pause and resume whenever needed.',
      'Review and Edit - double-check answers, flag doubts.',
      'Analyze Results - study analytics to plan next steps.'
    ];
    steps.forEach((step, idx) => {
      pdf.setFont(FONTS.body, 'bold');
      pdf.setFontSize(9);
      pdf.text(`${idx + 1}.`, marginX + 2, currentY);
      pdf.setFont(FONTS.body, 'normal');
      const sanitizedStep = sanitizeText(step);
      pdf.text(sanitizedStep, marginX + 8, currentY);
      currentY += 5;
    });

    // Footer shield + code
    pdf.setDrawColor(COLORS.black);
    pdf.setLineWidth(0.6);
    const footerY = pageHeight - marginY + 2;
    pdf.rect(marginX, footerY, 20, 10, 'D');
    pdf.setFont(FONTS.body, 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.black);
    pdf.text(sanitizeText('THK'), marginX + 10, footerY + 6, { align: 'center' });
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.code);
    pdf.text(sanitizeText('THK-PT1'), pageWidth - marginX, footerY + 6, { align: 'right' });
    pdf.addPage();
    page++;

    // --- QUESTIONS: TWO-COLUMN ROW LAYOUT ---
    const lineHeight = 3.8; // reasonable line height

    const drawDivider = () => {
      pdf.setDrawColor(COLORS.divider);
      pdf.setLineWidth(0.3);
      const dashLength = 2; // mm
      const gapLength = 2; // mm
      const totalLength = dashLength + gapLength;
      let y = marginY;
      
      while (y < pageHeight - marginY) {
        const endY = Math.min(y + dashLength, pageHeight - marginY);
        pdf.line(dividerX, y, dividerX, endY);
        y += totalLength;
      }
    };
    drawDivider();

    let currentRowY = marginY;

    // Helper to measure full block height
    const measureQuestionHeight = async (question) => {
      const textWidth = colWidth;
      const toMm = (pt) => pt * 0.3528;

      // Sanitize all text fields
      const sanitizedPassageText = sanitizeText(question.passageText || '');
      const sanitizedQuestionText = sanitizeText(question.questionText || '');

      pdf.setFont(FONTS.body, 'normal');
      pdf.setFontSize(10); // reasonable passage font
      const passageLines = pdf.splitTextToSize(sanitizedPassageText, textWidth);
      const passageH = passageLines.length * toMm(10) * 1.2;

      pdf.setFont(FONTS.body, 'normal');
      pdf.setFontSize(10); // reasonable question font
      const questionLines = pdf.splitTextToSize(sanitizedQuestionText, textWidth);
      const questionH = questionLines.length * toMm(10) * 1.2;

      pdf.setFont(FONTS.body, 'normal');
      pdf.setFontSize(9); // reasonable answer choice font
      const choices = ['A', 'B', 'C', 'D'];
      let answersH = 0;
      for (const ch of choices) {
        const sanitizedChoice = sanitizeText(question.answerChoices[ch] || '');
        const lines = pdf.splitTextToSize(`${ch}) ${sanitizedChoice}`, textWidth);
        answersH += lines.length * toMm(9) * 1.15 + 2;
      }

      // Image height calculation
      let imgH = 0;
      if (question.passageImage) {
        try {
          const img = await loadImage(question.passageImage);
          const imgW = textWidth;
          imgH = Math.min(imgW * (img.height / img.width) + 3, 50); // reasonable max image height
        } catch {
          imgH = 0;
        }
      }

      const blockH = Math.max(questionBoxSize, passageH + imgH + questionH + answersH + 12);
      return { passageLines, questionLines, answersH, blockH, passageH, questionH, imgH };
    };

    // render helper (uses cached measure)
    const renderQuestion = async (measurement, question, colIndex, startY, questionNumber) => {
      const startX = colIndex === 0 ? marginX : marginX + colWidth + gutter;
      const boxX = startX;
      const textX = startX;
      let cursorY = startY;

      // Header bar
      pdf.setFillColor(COLORS.black);
      pdf.rect(boxX, cursorY, questionBoxSize, questionBoxSize, 'F');
      pdf.setFillColor(COLORS.grayBar);
      pdf.rect(boxX + questionBoxSize, cursorY, colWidth - questionBoxSize, questionBoxSize, 'F');

      // Centered number
      pdf.setFont(FONTS.body, 'bold');
      pdf.setFontSize(8); // reasonable question number
      pdf.setTextColor(COLORS.white);
      const numFontHeight = 8 * 0.3528;
      pdf.text(String(questionNumber), boxX + questionBoxSize / 2, cursorY + questionBoxSize / 2 + numFontHeight / 2, { align: 'center' });

      cursorY += questionBoxSize + 2;

      // Passage
      pdf.setFont(FONTS.body, 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(COLORS.text);
      pdf.text(measurement.passageLines, textX, cursorY + 2, { maxWidth: colWidth, lineHeightFactor: 1.2 });
      cursorY += measurement.passageH + 3;

      // Image with better error handling
      if (question.passageImage && measurement.imgH > 0) {
        try {
          const imgType = question.passageImage.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
          pdf.addImage(question.passageImage, imgType, textX, cursorY, colWidth, measurement.imgH);
          cursorY += measurement.imgH + 2;
        } catch (error) {
  
        }
      }

      // Question text
      pdf.setFont(FONTS.body, 'normal');
      pdf.setFontSize(10);
      pdf.text(measurement.questionLines, textX, cursorY, { maxWidth: colWidth, lineHeightFactor: 1.2 });
      cursorY += measurement.questionH + 3;

      // Answer choices
      pdf.setFont(FONTS.body, 'normal');
      pdf.setFontSize(9);
      const choices = ['A','B','C','D'];
      for (const ch of choices) {
        const sanitizedChoice = sanitizeText(question.answerChoices[ch] || '');
        const lines = pdf.splitTextToSize(`${ch}) ${sanitizedChoice}`, colWidth);
        pdf.text(lines, textX, cursorY, { maxWidth: colWidth, lineHeightFactor: 1.15 });
        cursorY += lines.length * lineHeight + 2;
      }
    };

    let questionNumber = 1;
    for (let idx = 0; idx < exportableQuestions.length; idx += 2) {
      const leftQ = exportableQuestions[idx];
      const rightQ = exportableQuestions[idx + 1] || null;

      const leftMeasure = await measureQuestionHeight(leftQ);
      let rightMeasure = null;
      if (rightQ) rightMeasure = await measureQuestionHeight(rightQ);

      const rowHeight = Math.max(leftMeasure.blockH, rightMeasure ? rightMeasure.blockH : 0);

      // New page if not enough space
      if (currentRowY + rowHeight > pageHeight - marginY) {
        if (page > 1) {
          const bottomLabelY = pageHeight - marginY + 8;

          // Page number
          pdf.setFont(FONTS.body, 'bold');
          pdf.setFontSize(12);
          pdf.setTextColor(COLORS.text);
          pdf.text(String(page), pageWidth / 2, bottomLabelY, { align: 'center' });

          // Continue indicator
          if (idx + 2 < exportableQuestions.length) {
            const text = 'Continue';
            pdf.setFont(FONTS.body, 'bold');
            pdf.setFontSize(11);
            pdf.setTextColor(COLORS.text);

            const textX = pageWidth - marginX - 8;
            pdf.text(sanitizeText(text), textX, bottomLabelY, { align: 'right' });

            const arrowStartX = textX + 2;
            const arrowY = bottomLabelY - 1.5;
            const arrowLen = 6;
            pdf.setDrawColor(COLORS.text);
            pdf.setLineWidth(1);
            pdf.line(arrowStartX, arrowY, arrowStartX + arrowLen, arrowY);
            pdf.line(arrowStartX + arrowLen, arrowY, arrowStartX + arrowLen - 2, arrowY - 2);
            pdf.line(arrowStartX + arrowLen, arrowY, arrowStartX + arrowLen - 2, arrowY + 2);
          }
        }
        
        pdf.addPage();
        page++;
        drawDivider();
        currentRowY = marginY;
      }

      // Render questions
      await renderQuestion(leftMeasure, leftQ, 0, currentRowY, questionNumber);
      questionNumber++;

      if (rightQ) {
        await renderQuestion(rightMeasure, rightQ, 1, currentRowY, questionNumber);
        questionNumber++;
      }

      currentRowY += rowHeight + 5;
    }
    
    // Add page number to the last page with questions
    if (page > 1) {
      const bottomLabelY = pageHeight - marginY + 8;
      pdf.setFont(FONTS.body, 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(COLORS.text);
      pdf.text(String(page), pageWidth / 2, bottomLabelY, { align: 'center' });
      
      const text = 'Continue';
      pdf.setFont(FONTS.body, 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(COLORS.text);
      const textX = pageWidth - marginX - 8;
      pdf.text(sanitizeText(text), textX, bottomLabelY, { align: 'right' });
      const arrowStartX = textX + 2;
      const arrowY = bottomLabelY - 1.5;
      const arrowLen = 6;
      pdf.setDrawColor(COLORS.text);
      pdf.setLineWidth(1);
      pdf.line(arrowStartX, arrowY, arrowStartX + arrowLen, arrowY);
      pdf.line(arrowStartX + arrowLen, arrowY, arrowStartX + arrowLen - 2, arrowY - 2);
      pdf.line(arrowStartX + arrowLen, arrowY, arrowStartX + arrowLen - 2, arrowY + 2);
    }
    
    // --- ANSWER KEY ---
    pdf.addPage();
    page++;
    
    // Answer Key Header
    pdf.setFont(FONTS.heading, 'bold');
    pdf.setFontSize(18); // reasonable header size
    pdf.setTextColor(COLORS.text);
    pdf.text(sanitizeText('Answer Key'), marginX, marginY);
    
    // Underline
    pdf.setDrawColor(COLORS.underline);
    pdf.setLineWidth(2);
    pdf.line(marginX, marginY + 6, marginX + 50, marginY + 6);
    
    // Answer grid
    const answersPerRow = 8; // back to 8 columns
    const answerColWidth = (contentWidth - 20) / answersPerRow;
    const answerRowHeight = 12; // reasonable height
    let answerY = marginY + 20;
    let answerX = marginX;
    let answerNum = 1;
    
    for (let i = 0; i < exportableQuestions.length; i++) {
      const q = exportableQuestions[i];
      
      if (answerNum > 1 && (answerNum - 1) % answersPerRow === 0) {
        answerY += answerRowHeight + 4;
        answerX = marginX;
      }
      
      if (answerY + answerRowHeight + 10 > pageHeight - marginY) {
        pdf.addPage();
        page++;
        answerY = marginY + 20;
        answerX = marginX;
      }
      
      const col = (answerNum - 1) % answersPerRow;
      const currentX = marginX + (col * answerColWidth);
      
      // Answer box
      pdf.setFillColor(COLORS.white);
      pdf.setDrawColor(COLORS.divider);
      pdf.setLineWidth(0.6);
      pdf.roundedRect(currentX, answerY, answerColWidth - 2, answerRowHeight, 3, 3, 'FD');
      
      // Question number
      pdf.setFont(FONTS.body, 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(COLORS.text);
      pdf.text(`${answerNum}.`, currentX + 3, answerY + 8);
      
      // Correct answer
      pdf.setFont(FONTS.body, 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(COLORS.blue);
      const sanitizedAnswer = sanitizeText(q.correctAnswer || 'A');
      pdf.text(sanitizedAnswer, currentX + answerColWidth - 6, answerY + 8, { align: 'center' });
      
      answerNum++;
    }
    
    // Save
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const finalFilename = `${filename}_${timestamp}.pdf`;
    pdf.save(finalFilename);
    
    return { success: true, filename: finalFilename };
  } catch (error) {

    return { success: false, error: error.message };
  }
}; 