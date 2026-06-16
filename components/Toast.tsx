'use client';

import { useEffect, useState } from 'react';

const EVENT = 'apex-toast';

/** Fire a toast from any client component. */
export function toast(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
  navigator.vibrate?.(20);
}

interface ToastItem {
  id: number;
  message: string;
}

export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let counter = 0;
    function onToast(e: Event) {
      const message = (e as CustomEvent<string>).detail;
      const id = ++counter;
      setItems((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }, 2600);
    }
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div
      className="fixed left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}
    >
      {items.map((i) => (
        <div
          key={i.id}
          className="max-w-[396px] w-full rounded-xl bg-zinc-100 text-zinc-900 px-4 py-3 text-sm font-medium shadow-lg shadow-black/40 animate-[slideUp_200ms_ease-out]"
        >
          {i.message}
        </div>
      ))}
    </div>
  );
}
