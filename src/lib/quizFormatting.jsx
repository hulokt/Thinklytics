import React from 'react';

// Shared function to format passage text for all question types
export const formatPassageText = (text, questionType) => {
  if (!text) {
    return text;
  }

  // Apply three quotes formatting to ALL question types
  let formattedText = text;
  
  // Handle line breaks first - convert \n and \\n to actual line breaks
  formattedText = formattedText.replace(/\\n/g, '\n');
  formattedText = formattedText.replace(/\\\\n/g, '\n');
  
  // Replace three quotes with underline tags (for all question types)
  formattedText = formattedText.replace(/"""([^"]*)"""/g, '<u>$1</u>');
  
  // Replace double quotes with underline tags
  formattedText = formattedText.replace(/"([^"]*)"/g, '<u>$1</u>');
  
  // Replace three forward slashes with underline tags
  formattedText = formattedText.replace(/\/\/\/([^\/]*)\/\//g, '<u>$1</u>');
  
  // Replace three backslashes with underline tags
  formattedText = formattedText.replace(/\\\\([^\\]*)\\\\/g, '<u>$1</u>');
  
  // Replace three dashes with underline tags
  formattedText = formattedText.replace(/---([^-]*)---/g, '<u>$1</u>');
  
  // Replace multiple underscores with a single long underscore
  formattedText = formattedText.replace(/_{3,}/g, '<u>_____</u>');
  
  // Replace backslash-underscore patterns with regular underscores
  formattedText = formattedText.replace(/\\_/g, '_');

  // Rhetorical Synthesis formatting
  if (questionType === 'Rhetorical Synthesis') {
    // Handle any sentence ending with colon - insert break after colon
    const colonIndex = formattedText.indexOf(':');
    if (colonIndex !== -1) {
      const beforeColon = formattedText.substring(0, colonIndex + 1);
      const afterColon = formattedText.substring(colonIndex + 1).trim();
      
      // Split the text after colon into sentences
      const afterColonSentences = afterColon.split(/(?<=[.!?])\s+/);
      
      // Process each sentence after the colon
      const formattedAfterColonSentences = afterColonSentences.map(sentence => {
        let processedSentence = sentence.trim();
        
        // Check if this looks like a bullet point or note
        const isBulletPoint = /^[•\-\*]\s/.test(processedSentence) || 
                             /^\d+\.\s/.test(processedSentence) ||
                             /^[A-Z]\.\s/.test(processedSentence) ||
                             /^\([a-z]\)\s/.test(processedSentence) ||
                             /^[a-z]\)\s/.test(processedSentence);
        
        // Add bullet point if it doesn't already have one
        if (!isBulletPoint && processedSentence.length > 0) {
          processedSentence = '• ' + processedSentence;
        }
        
        return processedSentence;
      });
      
      // Join the formatted sentences and add line breaks
      const formattedAfterColon = formattedAfterColonSentences.join('\n');
      
      formattedText = beforeColon + '\n' + formattedAfterColon;
      
      // Convert line breaks to JSX line breaks and return early
      return formattedText.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < formattedText.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }

    // If no colon, apply general rhetorical synthesis formatting
    // First, protect common abbreviations and acronyms that contain periods
    const protectedPatterns = [
      /e\.g\./g,      // e.g.
      /i\.e\./g,      // i.e.
      /vs\./g,        // vs.
      /etc\./g,       // etc.
      /Mr\./g,        // Mr.
      /Mrs\./g,       // Mrs.
      /Dr\./g,        // Dr.
      /Prof\./g,      // Prof.
      /U\.S\./g,      // U.S.
      /U\.K\./g,      // U.K.
      /A\.M\./g,      // A.M.
      /P\.M\./g,      // P.M.
      /B\.C\./g,      // B.C.
      /A\.D\./g,      // A.D.
      /Ph\.D\./g,     // Ph.D.
      /M\.A\./g,      // M.A.
      /B\.A\./g,      // B.A.
      /M\.S\./g,      // M.S.
      /B\.S\./g,      // B.S.
      /Jr\./g,        // Jr.
      /Sr\./g,        // Sr.
      /Inc\./g,       // Inc.
      /Corp\./g,      // Corp.
      /Ltd\./g,       // Ltd.
      /Co\./g,        // Co.
      /St\./g,        // St.
      /Ave\./g,       // Ave.
      /Blvd\./g,      // Blvd.
      /Rd\./g,        // Rd.
      /Ct\./g,        // Ct.
      /Pl\./g,        // Pl.
      /Ln\./g,        // Ln.
      /P\.O\./g,      // P.O.
      /R\.S\.V\.P\./g, // R.S.V.P.
      /C\.E\.O\./g,   // C.E.O.
      /C\.F\.O\./g,   // C.F.O.
      /C\.T\.O\./g,   // C.T.O.
      /V\.P\./g,      // V.P.
      /D\.C\./g,      // D.C.
      /L\.A\./g,      // L.A.
      /N\.Y\./g,      // N.Y.
      /D\.I\.Y\./g,   // D.I.Y.
      /F\.Y\.I\./g,   // F.Y.I.
      /A\.S\.A\.P\./g, // A.S.A.P.
      /R\.I\.P\./g,   // R.I.P.
      /P\.S\./g,      // P.S.
      /P\.P\.S\./g,   // P.P.S.
      /A\.K\.A\./g,   // A.K.A.
      /B\.Y\.O\.B\./g, // B.Y.O.B.
      /R\.S\.V\.P\./g, // R.S.V.P.
      /T\.B\.D\./g,   // T.B.D.
      /T\.B\.A\./g,   // T.B.A.
      /E\.T\.A\./g,   // E.T.A.
      /Q\.&A\./g,     // Q.&A.
      /Q\.&A/g,       // Q.&A
    ];

    // Replace protected patterns with placeholders
    const placeholders = [];
    let placeholderIndex = 0;
    
    protectedPatterns.forEach(pattern => {
      formattedText = formattedText.replace(pattern, (match) => {
        const placeholder = `__PROTECTED_${placeholderIndex}__`;
        placeholders.push({ placeholder, original: match });
        placeholderIndex++;
        return placeholder;
      });
    });

    // Split by sentence endings (period, exclamation mark, question mark)
    const sentences = formattedText.split(/(?<=[.!?])\s+/);

    // Process each sentence
    const formattedSentences = sentences.map(sentence => {
      let processedSentence = sentence.trim();
      
      // Check if this looks like a bullet point or note
      const isBulletPoint = /^[•\-\*]\s/.test(processedSentence) || 
                           /^\d+\.\s/.test(processedSentence) ||
                           /^[A-Z]\.\s/.test(processedSentence) ||
                           /^\([a-z]\)\s/.test(processedSentence) ||
                           /^[a-z]\)\s/.test(processedSentence);
      
      // Add bullet point if it doesn't already have one
      if (!isBulletPoint && processedSentence.length > 0) {
        processedSentence = '• ' + processedSentence;
      }
      
      // Always add line break for each sentence
      processedSentence = '\n' + processedSentence;
      
      return processedSentence;
    });

    // Join sentences back together
    formattedText = formattedSentences.join(' ');

    // Restore protected patterns
    placeholders.forEach(({ placeholder, original }) => {
      formattedText = formattedText.replace(placeholder, original);
    });

    // Convert line breaks to JSX line breaks
    return formattedText.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < formattedText.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  }

  // Cross-Text Connections formatting
  if (questionType === 'Cross-Text Connections') {
    // Check if there are intro sections (Text 1 is... and Text 2 is...)
    const hasIntro = /Text 1\s+is/i.test(formattedText) && /Text 2\s+is/i.test(formattedText);
    
    if (hasIntro) {
      // For intro sections, only format the SECOND occurrences (actual text sections)
      // First, find and mark the second occurrences
      let text1Count = 0;
      let text2Count = 0;
      
      formattedText = formattedText.replace(/Text 1/g, (match) => {
        text1Count++;
        if (text1Count === 2) {
          return '\n\n<strong>Text 1</strong>\n';
        }
        return match; // Keep first occurrence as normal text
      });
      
      formattedText = formattedText.replace(/Text 2/g, (match) => {
        text2Count++;
        if (text2Count === 2) {
          return '\n\n<strong>Text 2</strong>\n';
        }
        return match; // Keep first occurrence as normal text
      });
    } else {
      // No intro sections, handle as direct text
      formattedText = formattedText.replace(/Text 1/g, '<strong>Text 1</strong>\n');
      formattedText = formattedText.replace(/Text 2/g, '\n\n<strong>Text 2</strong>\n');
    }
    
    // Split by line breaks and convert to JSX
    const lines = formattedText.split('\n');
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  }

  // Default: return formatted text for other question types
  // Split by line breaks and convert to JSX with HTML support
  const lines = formattedText.split('\n');
  return lines.map((line, index) => (
    <React.Fragment key={index}>
      <span dangerouslySetInnerHTML={{ __html: line }} />
      {index < lines.length - 1 && <br />}
    </React.Fragment>
  ));
};
