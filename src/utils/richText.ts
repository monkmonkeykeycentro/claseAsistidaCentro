import sanitizeHtml from 'sanitize-html';

/** Only the prose formatting supported by the CMS editor may be rendered. */
export function sanitizeRichText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'code'],
    allowedAttributes: { '*': ['style'], a: ['href', 'target', 'rel'], ol: ['start'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    allowedStyles: {
      '*': {
        color: [/^#[\da-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^hsla?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
        'text-align': [/^(left|center|right|justify)$/],
      },
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  });
}

export function richTextEditorContent(value: string, format?: 'html'): string {
  if (format === 'html') return sanitizeRichText(value);
  // Legacy prose can contain comparisons or literal HTML examples. Preserve it
  // as text until the author explicitly edits it with the visual editor.
  const escaped = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<p>${escaped.replace(/\r\n?/g, '\n').replace(/\n/g, '<br>')}</p>`;
}
