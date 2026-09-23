import { useCallback, useEffect, useRef, useState } from 'react';

type ProgressState = { active: boolean; pct: number; label: string };

/**
 * Shared upload progress state + bar used by every image/video upload
 * surface. `run(label, fn)` drives the bar: it creeps forward while the
 * file is being converted (WebP/WebM) and storage.ts reports real byte
 * progress once the transfer starts.
 */
export function useUploadProgress() {
  const [state, setState] = useState<ProgressState>({ active: false, pct: 0, label: '' });
  const timer = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  const run = useCallback(
    async <T,>(label: string, fn: (report: (pct: number) => void) => Promise<T>): Promise<T> => {
      stopTimer();
      setState({ active: true, pct: 5, label });
      // Slow creep while converting — real upload progress takes over later.
      timer.current = window.setInterval(() => {
        setState((s) => (s.active && s.pct < 55 ? { ...s, pct: s.pct + 2 } : s));
      }, 250);
      try {
        return await fn((pct) => setState((s) => (s.active ? { ...s, pct: Math.max(s.pct, Math.min(99, pct)) } : s)));
      } finally {
        stopTimer();
        setState({ active: true, pct: 100, label });
        window.setTimeout(() => setState({ active: false, pct: 0, label: '' }), 600);
      }
    },
    [stopTimer],
  );

  return { active: state.active, pct: state.pct, label: state.label, run };
}

export function UploadProgressBar({
  active,
  pct,
  label,
  className = '',
  tone = 'dark',
}: {
  active: boolean;
  pct: number;
  label: string;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  if (!active) return null;
  const text = tone === 'dark' ? 'text-slate-400' : 'text-zinc-600';
  const track = tone === 'dark' ? 'bg-white/10' : 'bg-zinc-200';
  const fill = tone === 'dark' ? 'bg-blue-500' : 'bg-blue-600';
  return (
    <div className={`space-y-1 ${className}`} role="status" aria-live="polite">
      <div className={`flex items-center justify-between text-[11px] font-semibold ${text}`}>
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className={`h-1.5 w-full overflow-hidden rounded-full ${track}`}>
        <div
          className={`h-full rounded-full ${fill} transition-[width] duration-300 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
