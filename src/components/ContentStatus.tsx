import React from 'react';

export function ContentStatus({ error, onRetry, loadingText = 'Cargando contenido…' }: {
  error?: string | null; onRetry: () => void; loadingText?: string;
}) {
  return (
    <div role={error ? 'alert' : 'status'} className="rounded-2xl border border-[#E1E7E1] bg-white p-6 text-sm text-[#59645C]">
      <p>{error || loadingText}</p>
      {error && <button onClick={onRetry} className="mt-3 rounded-lg border border-[#407B5D] px-4 py-2 font-semibold text-[#407B5D] cursor-pointer">Reintentar</button>}
    </div>
  );
}
