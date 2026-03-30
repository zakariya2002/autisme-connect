import { sanitizeHtmlServer } from '../helpers/sanitize-html';

describe('sanitizeHtmlServer', () => {
  // ── Script injection ──
  it('should remove <script> tags with content', () => {
    const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
    expect(sanitizeHtmlServer(input)).toBe('<p>Hello</p><p>World</p>');
  });

  it('should remove self-closing script tags', () => {
    expect(sanitizeHtmlServer('<script src="evil.js"/>')).toBe('');
  });

  it('should remove script tags case-insensitively', () => {
    expect(sanitizeHtmlServer('<SCRIPT>alert(1)</SCRIPT>')).toBe('');
    expect(sanitizeHtmlServer('<ScRiPt>alert(1)</ScRiPt>')).toBe('');
  });

  // ── Iframe injection ──
  it('should remove iframe tags', () => {
    expect(sanitizeHtmlServer('<iframe src="evil.com"></iframe>')).toBe('');
  });

  it('should remove self-closing iframe', () => {
    expect(sanitizeHtmlServer('<iframe src="evil.com"/>')).toBe('');
  });

  // ── Object/embed injection ──
  it('should remove object tags', () => {
    expect(sanitizeHtmlServer('<object data="evil.swf"></object>')).toBe('');
  });

  it('should remove embed tags', () => {
    expect(sanitizeHtmlServer('<embed src="evil.swf"/>')).toBe('');
  });

  // ── Form injection ──
  it('should remove form tags', () => {
    expect(sanitizeHtmlServer('<form action="evil.com"><input type="text"></form>')).toBe('');
  });

  // ── SVG/Math injection ──
  it('should remove SVG tags', () => {
    expect(sanitizeHtmlServer('<svg onload="alert(1)"></svg>')).toBe('');
  });

  it('should remove math tags', () => {
    expect(sanitizeHtmlServer('<math><mi>x</mi></math>')).toBe('');
  });

  // ── Event handler injection ──
  it('should remove onclick handlers', () => {
    expect(sanitizeHtmlServer('<div onclick="alert(1)">Click</div>')).toBe('<div >Click</div>');
  });

  it('should remove onerror handlers', () => {
    expect(sanitizeHtmlServer('<img src="x" onerror="alert(1)">')).toBe('<img src="x" >');
  });

  it('should remove onload handlers', () => {
    expect(sanitizeHtmlServer('<body onload="alert(1)">')).toBe('<body >');
  });

  it('should remove onmouseover handlers', () => {
    expect(sanitizeHtmlServer('<a onmouseover="alert(1)">link</a>')).toBe('<a >link</a>');
  });

  // ── JavaScript URI injection ──
  it('should remove javascript: URIs in href', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeHtmlServer(input);
    expect(result).not.toContain('javascript:');
  });

  it('should remove vbscript: URIs', () => {
    const input = '<a href="vbscript:alert(1)">click</a>';
    const result = sanitizeHtmlServer(input);
    expect(result).not.toContain('vbscript:');
  });

  // ── Style-based XSS ──
  it('should remove style attributes with expression()', () => {
    const input = '<div style="width: expression(alert(1))">test</div>';
    expect(sanitizeHtmlServer(input)).toBe('<div >test</div>');
  });

  it('should remove style attributes with url()', () => {
    const input = '<div style="background: url(javascript:alert(1))">test</div>';
    expect(sanitizeHtmlServer(input)).toBe('<div >test</div>');
  });

  // ── Meta refresh injection ──
  it('should remove meta refresh tags', () => {
    expect(sanitizeHtmlServer('<meta http-equiv="refresh" content="0;url=evil.com">')).toBe('');
  });

  // ── Base tag injection ──
  it('should remove base tags', () => {
    expect(sanitizeHtmlServer('<base href="evil.com">')).toBe('');
  });

  // ── Safe content preserved ──
  it('should preserve safe HTML', () => {
    const safe = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em></p>';
    expect(sanitizeHtmlServer(safe)).toBe(safe);
  });

  it('should preserve links without dangerous protocols', () => {
    const safe = '<a href="https://example.com" target="_blank">Link</a>';
    expect(sanitizeHtmlServer(safe)).toBe(safe);
  });

  it('should preserve images with safe src', () => {
    const safe = '<img src="https://example.com/img.png" alt="Image">';
    expect(sanitizeHtmlServer(safe)).toBe(safe);
  });

  it('should handle empty string', () => {
    expect(sanitizeHtmlServer('')).toBe('');
  });

  it('should handle plain text without HTML', () => {
    const text = 'Bonjour, ceci est un texte simple.';
    expect(sanitizeHtmlServer(text)).toBe(text);
  });
});
