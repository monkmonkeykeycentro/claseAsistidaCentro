import { lazy, Suspense } from 'react';

export interface RichTextEditorProps {
  value: string;
  format?: 'html';
  label?: string;
  onChange: (html: string) => void;
}

// Load the editing engine only when an author opens a prose block.
const VisualEditor = lazy(() => import('./RichTextEditorImpl'));

export function RichTextEditor(props: RichTextEditorProps) {
  return <Suspense fallback={<p role="status" className="rounded-xl border p-3 text-xs">Cargando editor de texto…</p>}>
    <VisualEditor {...props} />
  </Suspense>;
}
