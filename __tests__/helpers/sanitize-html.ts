/**
 * Extracted server-side sanitization logic from lib/sanitize-html.ts
 * Pure function for testing XSS prevention without DOM/DOMPurify dependency.
 */
export function sanitizeHtmlServer(dirty: string): string {
  return dirty
    // Remove script, style, iframe, object, embed, form, math, and SVG elements entirely
    .replace(/<(script|style|iframe|object|embed|form|math|svg)\b[^]*?<\/\1\s*>/gi, '')
    // Remove self-closing or unclosed dangerous tags
    .replace(/<(script|iframe|object|embed|form|math|svg)\b[^>]*\/?>/gi, '')
    // Remove all on* event handlers (with quotes, without quotes, or with backticks)
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s>]+)/gi, '')
    // Remove javascript:, vbscript:, and data: URIs in href/src/action attributes
    .replace(/(href|src|action|xlink:href|formaction)\s*=\s*(?:"[^"]*(?:javascript|vbscript|data)\s*:[^"]*"|'[^']*(?:javascript|vbscript|data)\s*:[^']*')/gi, '')
    // Remove javascript:/vbscript: anywhere (catches url() in styles, etc.)
    .replace(/(?:javascript|vbscript)\s*:/gi, '')
    // Remove style attributes containing expression(), url(), or -moz-binding
    .replace(/style\s*=\s*(?:"[^"]*(?:expression|url|\\|@import|-moz-binding)[^"]*"|'[^']*(?:expression|url|\\|@import|-moz-binding)[^']*')/gi, '')
    // Remove meta refresh tags
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, '')
    // Remove base tags (can redirect all relative URLs)
    .replace(/<base\b[^>]*>/gi, '');
}
