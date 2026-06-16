import type { DealHealthLevel } from '@/lib/scoring';

const COLORS: Record<DealHealthLevel, string> = {
  'on-track': '#4ade80', // green-400
  'at-risk': '#facc15', // yellow-400
  critical: '#f87171', // red-400
};

interface HealthRingProps {
  score: number;
  level: DealHealthLevel;
  size?: number;
  strokeWidth?: number;
  showScore?: boolean;
}

export function HealthRing({
  score,
  level,
  size = 48,
  strokeWidth = 4,
  showScore = true,
}: HealthRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;
  const color = COLORS[level];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
        />
      </svg>
      {showScore && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold" style={{ color, fontSize: size * 0.28 }}>
            {score}
          </span>
        </div>
      )}
    </div>
  );
}
