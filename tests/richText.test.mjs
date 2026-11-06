import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { sanitizeRichText, richTextEditorContent } from '../src/utils/richText.ts';
import { RichTextContent } from '../src/components/RichTextContent.tsx';

const render = (content, format) => renderToStaticMarkup(React.createElement(RichTextContent, { content, format }));

test('formatted prose retains bold, italics, underline, color, headings, lists and alignment', () => {
  const content = '<h2 style="text-align:center">Título</h2><p><strong>Negrita</strong> <em>Cursiva</em> <u>Subrayado</u> <s>Tachado</s> <span style="color: rgb(255, 0, 0)">Color</span></p><ol start="3"><li>Uno</li></ol><ul><li>Dos</li></ul>';
  const html = render(content, 'html');
  assert.match(html, /<h2 style="text-align:center">Título<\/h2>/);
  for (const tag of ['strong', 'em', 'u', 's', 'ol', 'ul', 'li']) assert.ok(html.includes(`<${tag}`));
  assert.match(html, /color:rgb\(255, 0, 0\)/);
  assert.doesNotMatch(html, /&lt;(strong|p|h2)/);
});

test('legacy plain text stays literal and is safely converted when opening the editor', () => {
  const text = '1 < 2 && 3 > 1\n<strong>Texto literal</strong>\nsegunda línea';
  const html = render(text);
  assert.match(html, /&lt;strong&gt;Texto literal&lt;\/strong&gt;/);
  assert.doesNotMatch(html, /<strong>/);
  assert.equal(richTextEditorContent(text), '<p>1 &lt; 2 &amp;&amp; 3 &gt; 1<br>&lt;strong&gt;Texto literal&lt;/strong&gt;<br>segunda línea</p>');
  assert.equal(richTextEditorContent('', 'html'), '');
});

test('HTML rendering strips executable content, event handlers, embedded media and arbitrary styles', () => {
  const dirty = '<script>alert(1)</script><style>body{display:none}</style><iframe src="https://bad.example"></iframe><img src="x" onerror="alert(1)"><svg onload="alert(1)"></svg><p onclick="alert(1)" style="position:fixed;inset:0;background:url(https://bad.example);color:#ff0000;text-align:right">Texto</p><span style="color:expression(alert(1))">Otro</span>';
  const clean = sanitizeRichText(dirty);
  assert.doesNotMatch(clean, /script|alert|iframe|onerror|onclick|svg|position|background|inset|expression|bad.example/);
  assert.match(clean, /color:#ff0000;text-align:right/);
  assert.match(clean, /Texto/);
  assert.equal(richTextEditorContent(dirty, 'html'), clean);
});

test('links reject unsafe schemes and keep safe destinations with isolated new tabs', () => {
  const clean = sanitizeRichText('<a href="javascript:alert(1)" onclick="evil()">No</a><a href="data:text/html,evil">No</a><a href="//bad.example">No</a><a href="https://centro.edu.mx" target="_self">Sí</a><a href="mailto:docente@centro.edu.mx">Correo</a>');
  assert.doesNotMatch(clean, /javascript|data:|evil|bad.example|_self/);
  assert.match(clean, /href="https:\/\/centro.edu.mx"/);
  assert.match(clean, /rel="noopener noreferrer"/);
  assert.match(clean, /href="mailto:docente@centro.edu.mx"/);
});
