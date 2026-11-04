/**
 * Strict Email vs Non-Email (e.g. Source Code, Terminal, Raw Text) Validator
 * Ensures SpoofSentry only analyzes genuine email messages and RFC-822 headers.
 */

export interface EmailValidationResult {
  isEmail: boolean;
  detectedType: 'email' | 'source_code' | 'terminal_output' | 'structured_data' | 'empty' | 'non_email_text';
  reason: string;
  details?: string[];
}

// Common source code patterns across popular languages (JS/TS, Python, C/C++, Java, Go, Rust, PHP, HTML)
const CODE_PATTERNS = [
  { pattern: /\bimport\s+.*?\s+from\s+['"][^'"]+['"]/i, desc: 'ES Module / TypeScript import' },
  { pattern: /\bimport\s+(?:os|sys|re|json|math|typing|datetime)\b/i, desc: 'Python import statement' },
  { pattern: /\bfrom\s+[a-zA-Z0-9_.]+\s+import\s+/i, desc: 'Python from-import statement' },
  { pattern: /\bexport\s+(?:default|const|let|var|function|class|interface|type)\b/i, desc: 'JavaScript/TypeScript export' },
  { pattern: /\b(?:const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*/i, desc: 'Variable declaration' },
  { pattern: /\bfunction\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{/i, desc: 'Function definition' },
  { pattern: /\bdef\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\):/i, desc: 'Python function definition' },
  { pattern: /\bclass\s+[A-Z][a-zA-Z0-9_]*(?:\s+extends\s+[A-Za-z0-9_]+|\s*\([^)]*\))?\s*\{/i, desc: 'Class definition' },
  { pattern: /\bpublic\s+(?:static\s+)?(?:void|class|interface|int|String|boolean)\b/i, desc: 'Java/C# signature' },
  { pattern: /#include\s*<[a-zA-Z0-9_.]+>/i, desc: 'C/C++ include header' },
  { pattern: /\bconsole\.(?:log|error|warn|info|debug)\s*\(/i, desc: 'Console logging statement' },
  { pattern: /\bSystem\.out\.println\s*\(/i, desc: 'Java print statement' },
  { pattern: /\bprint\s*\([^\n]+\)/i, desc: 'Python print statement' },
  { pattern: /\b(?:interface|type)\s+[A-Z][a-zA-Z0-9_]*\s*(?:=|\{)/i, desc: 'TypeScript interface or type definition' },
  { pattern: /\b(?:async\s+function|await\s+[a-zA-Z0-9_.]+\()/i, desc: 'Async/await syntax' },
  { pattern: /\breturn\s+(?:<[A-Za-z]|true|false|null|undefined|Promise|\{[^}]*\});/i, desc: 'Code return statement' },
  { pattern: /<[a-zA-Z][a-zA-Z0-9]*\s+class(?:Name)?=["'][^"']*["']/i, desc: 'HTML/JSX tag markup' },
  { pattern: /<!DOCTYPE\s+html>|<html(?:\s+[^>]*)?>|<script(?:\s+[^>]*)?>/i, desc: 'HTML document tags' },
  { pattern: /^(?:\s*\d+[\s:|]+|\s*line\s+\d+)/im, desc: 'Code editor line numbers' },
  { pattern: /\b(?:SELECT|INSERT|UPDATE|DELETE)\s+.*?\s+FROM\s+/i, desc: 'SQL query statement' },
  { pattern: /^(?:git\s+|npm\s+|yarn\s+|pip\s+|docker\s+|curl\s+|sudo\s+)/im, desc: 'Command line terminal syntax' }
];

/**
 * Validates whether an input is genuinely an email or is source code/non-email.
 */
export function validateEmailInput(input: {
  text?: string;
  from?: string;
  subject?: string;
  body?: string;
  source?: string;
}): EmailValidationResult {
  // If source is direct Gmail sync, this is by definition an authentic email message
  if (input.source === 'gmail') {
    return {
      isEmail: true,
      detectedType: 'email',
      reason: 'Authentic email message fetched via Google Gmail API.'
    };
  }

  const text = (input.text || '').trim();
  const from = (input.from || '').trim();
  const subject = (input.subject || '').trim();
  const body = (input.body || '').trim();

  // If sender address is clearly present with @, it is an email
  if (from && /@/.test(from)) {
    return {
      isEmail: true,
      detectedType: 'email',
      reason: 'Valid email message with authenticated sender address.'
    };
  }

  const combined = [from, subject, body, text].filter(Boolean).join('\n').trim();

  if (!combined) {
    return {
      isEmail: false,
      detectedType: 'empty',
      reason: 'No content provided. Please upload an email screenshot or paste email text.'
    };
  }

  // 1. Check for Code Patterns
  const matchedCodePatterns: string[] = [];
  for (const { pattern, desc } of CODE_PATTERNS) {
    if (pattern.test(combined)) {
      matchedCodePatterns.push(desc);
    }
  }

  // Check code syntax symbols ratio
  const codeSymbolMatches = combined.match(/[{}();=<>[\]|&~^$!%*+\\]/g) || [];
  const symbolRatio = combined.length > 0 ? (codeSymbolMatches.length / combined.length) : 0;

  // 2. Check for Genuine Email Headers
  const hasFromHeader = /^From:\s*.+/im.test(combined) || (from && from.includes('@'));
  const hasSubjectHeader = /^Subject:\s*.+/im.test(combined) || Boolean(subject);
  const hasDateHeader = /^Date:\s*.+/im.test(combined);
  const hasReturnPath = /^Return-Path:\s*.+/im.test(combined);
  const hasDkim = /^DKIM-Signature:\s*.+/im.test(combined);
  const hasReceived = /^Received:\s*.+/im.test(combined);

  const emailHeaderCount = [hasFromHeader, hasSubjectHeader, hasDateHeader, hasReturnPath, hasDkim, hasReceived].filter(Boolean).length;

  // 3. Strict Check: If multiple code patterns matched, or high code symbol ratio without RFC email structure
  if (matchedCodePatterns.length >= 2 || (matchedCodePatterns.length >= 1 && emailHeaderCount === 0)) {
    return {
      isEmail: false,
      detectedType: 'source_code',
      reason: 'The content appears to be programming source code rather than an email message.',
      details: matchedCodePatterns
    };
  }

  if (symbolRatio > 0.15 && emailHeaderCount === 0) {
    return {
      isEmail: false,
      detectedType: 'source_code',
      reason: 'High density of programming code syntax detected without email headers.',
      details: [`Code syntax ratio: ${(symbolRatio * 100).toFixed(1)}%`]
    };
  }

  // 4. Check for sender email validity
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const hasAnyEmailAddress = emailRegex.test(combined);

  // If there is no email address at all, and no email headers
  if (!hasAnyEmailAddress && emailHeaderCount === 0) {
    return {
      isEmail: false,
      detectedType: 'non_email_text',
      reason: 'No sender email address, recipient, or RFC-822 email headers found. Only email messages can be analyzed.'
    };
  }

  // If "from" was provided but does not contain a valid email address (e.g. line numbers or code variables)
  if (from && !emailRegex.test(from) && !from.toLowerCase().includes('unknown')) {
    // If "from" is clearly not an email address, e.g. "123" or "const foo"
    if (/^\d+$/.test(from) || /^(?:const|let|var|function|def|import)\b/i.test(from)) {
      return {
        isEmail: false,
        detectedType: 'source_code',
        reason: `Invalid sender value ("${from}"). This appears to be code or line numbers, not an email sender address.`
      };
    }
  }

  // If text looks conversational or has headers, and is not code, it's valid
  return {
    isEmail: true,
    detectedType: 'email',
    reason: 'Valid email format detected.'
  };
}
