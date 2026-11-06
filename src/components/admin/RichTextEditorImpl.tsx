import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Unlink, RemoveFormatting, Undo2, Redo2 } from 'lucide-react';
import { richTextEditorContent, sanitizeRichText } from '../../utils/richText';

import type { RichTextEditorProps } from './RichTextEditor';

export default function RichTextEditorImpl({ value, format, label = 'Texto', onChange }: RichTextEditorProps) {
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const lastEmitted = useRef<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, horizontalRule: false, link: { openOnClick: false, autolink: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } } }),
      TextStyle, Color, TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: richTextEditorContent(value, format),
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { role: 'textbox', 'aria-label': label, 'aria-multiline': 'true', class: 'cms-rich-text min-h-32 p-3 text-sm outline-none' },
      transformPastedHTML: sanitizeRichText,
    },
    onUpdate: ({ editor: updated }) => {
      const html = updated.isEmpty ? '' : sanitizeRichText(updated.getHTML());
      lastEmitted.current = html;
      changeRef.current(html);
    },
  });

  useEffect(() => {
    if (!editor || (format === 'html' && value === lastEmitted.current)) return;
    const html = richTextEditorContent(value, format);
    if (editor.getHTML() !== html) editor.commands.setContent(html, { emitUpdate: false });
  }, [editor, value, format]);

  if (!editor) return <div className="rounded-xl border p-3 text-xs">Cargando editor de texto…</div>;

  const button = (name: string, icon: React.ReactNode, action: () => void, active = false, disabled = false) => (
    <button key={name} type="button" title={name} aria-label={name} aria-pressed={active} disabled={disabled}
      onMouseDown={(event) => event.preventDefault()} onClick={action}
      className={`rounded-lg border p-2 disabled:opacity-35 ${active ? 'border-[#407B5D] bg-[#E8EEE8] text-[#28543D]' : 'border-transparent hover:border-[#E1E7E1] hover:bg-white'}`}>{icon}</button>
  );
  const iconClass = 'h-4 w-4';
  const applyLink = () => {
    try {
      const href = new URL(linkUrl.trim());
      if (!['http:', 'https:', 'mailto:'].includes(href.protocol)) throw new Error();
      editor.chain().focus().extendMarkRange('link').setLink({ href: href.href }).run();
      setLinkOpen(false);
      setLinkError('');
    } catch { setLinkError('Usa una dirección https://, http:// o mailto: válida.'); }
  };

  return <div className="overflow-hidden rounded-xl border border-[#E1E7E1] bg-white text-[#232A24]">
    <div role="toolbar" aria-label={`Formato de ${label}`} className="flex flex-wrap items-center gap-0.5 border-b border-[#E1E7E1] bg-[#F7F8F4] p-1.5">
      <select aria-label="Estilo del texto" value={editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
        onChange={(event) => event.target.value === 'p' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().setHeading({ level: event.target.value === 'h2' ? 2 : 3 }).run()} className="mr-1 rounded-lg border border-[#E1E7E1] bg-white p-1.5 text-xs">
        <option value="p">Párrafo</option><option value="h2">Título</option><option value="h3">Subtítulo</option>
      </select>
      {button('Negrita', <Bold className={iconClass} />, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {button('Cursiva', <Italic className={iconClass} />, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      {button('Subrayado', <Underline className={iconClass} />, () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
      {button('Tachado', <Strikethrough className={iconClass} />, () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
      <label title="Color del texto" className="mx-1 flex items-center gap-1 rounded-lg border border-[#E1E7E1] bg-white px-2 py-1 text-xs">
        Color<input type="color" aria-label="Color del texto" defaultValue="#232a24" onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} className="h-6 w-7 cursor-pointer border-0 p-0" />
      </label>
      {button('Lista con viñetas', <List className={iconClass} />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
      {button('Lista numerada', <ListOrdered className={iconClass} />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      {button('Alinear a la izquierda', <AlignLeft className={iconClass} />, () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }))}
      {button('Centrar texto', <AlignCenter className={iconClass} />, () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }))}
      {button('Alinear a la derecha', <AlignRight className={iconClass} />, () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }))}
      {button('Añadir enlace', <Link className={iconClass} />, () => { setLinkUrl(editor.getAttributes('link').href || ''); setLinkError(''); setLinkOpen((open) => !open); }, editor.isActive('link'))}
      {button('Quitar enlace', <Unlink className={iconClass} />, () => editor.chain().focus().unsetLink().run(), false, !editor.isActive('link'))}
      {button('Limpiar formato', <RemoveFormatting className={iconClass} />, () => editor.chain().focus().unsetAllMarks().clearNodes().unsetTextAlign().run())}
      {button('Deshacer', <Undo2 className={iconClass} />, () => editor.chain().focus().undo().run(), false, !editor.can().undo())}
      {button('Rehacer', <Redo2 className={iconClass} />, () => editor.chain().focus().redo().run(), false, !editor.can().redo())}
    </div>
    {linkOpen && <div className="space-y-2 border-b border-[#E1E7E1] p-2">
      <div className="flex flex-wrap gap-2"><input type="url" aria-label="Dirección del enlace" placeholder="https://..." value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); applyLink(); } }} className="min-w-40 flex-1 rounded-lg border p-2 text-xs" />
        <button type="button" onClick={applyLink} className="rounded-lg bg-[#407B5D] px-3 py-2 text-xs text-white">Aplicar enlace</button>
        <button type="button" onClick={() => setLinkOpen(false)} className="rounded-lg border px-3 py-2 text-xs">Cancelar</button>
      </div>
      {linkError && <p role="alert" className="text-xs text-red-800">{linkError}</p>}
    </div>}
    <EditorContent editor={editor} />
    <p className="border-t border-[#E1E7E1] px-3 py-1.5 text-[11px] text-[#59645C]">Selecciona el texto y aplica formato. Los cambios se conservan al guardar el contenido.</p>
  </div>;
}
