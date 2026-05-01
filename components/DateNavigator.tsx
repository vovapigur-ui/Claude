'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, isToday, addDaysToDate } from '@/lib/utils';

interface DateNavigatorProps {
  date: string;
  onDateChange: (date: string) => void;
}

export function DateNavigator({ date, onDateChange }: DateNavigatorProps) {
  const currentDay = isToday(date);

  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <button
        onClick={() => onDateChange(addDaysToDate(date, -1))}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 active:bg-zinc-800 active:scale-95 transition-all duration-200 border border-zinc-800"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="text-center">
        <p className="font-mono text-sm text-zinc-200 uppercase tracking-widest">
          {formatDate(date)}
        </p>
        {currentDay && (
          <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest">
            Today
          </span>
        )}
      </div>

      <button
        onClick={() => onDateChange(addDaysToDate(date, 1))}
        disabled={currentDay}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 active:bg-zinc-800 active:scale-95 transition-all duration-200 border border-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
