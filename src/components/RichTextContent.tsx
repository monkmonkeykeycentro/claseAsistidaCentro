import { useMemo } from 'react';
import { sanitizeRichText } from '../utils/richText';

export function RichTextContent({ content, format }: { content: string; format?: 'html' }) {
  const html = useMemo(() => format === 'html' ? sanitizeRichText(content) : '', [content, format]);
  return format === 'html'
    ? <div className="cms-rich-text text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
    : <div className="text-sm leading-relaxed whitespace-pre-line">{content}</div>;
}
