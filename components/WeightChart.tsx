'use client';

import { formatShortDate } from '@/lib/utils';

export interface ChartDataPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: ChartDataPoint[];
  goalWeight: number;
  startWeight: number;
}

export function WeightChart({ data, goalWeight, startWeight }: WeightChartProps) {
  const W = 340;
  const H = 200;
  const PL = 44; // padding left
  const PR = 16;
  const PT = 20;
  const PB = 32;

  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] gap-2">
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
          No weigh-ins yet
        </p>
        <p className="font-mono text-[10px] text-zinc-700">Log your morning weight on the Today tab</p>
      </div>
    );
  }

  const weights = data.map((d) => d.weight);
  const rawMin = Math.min(...weights, goalWeight);
  const rawMax = Math.max(...weights, startWeight);
  const pad = (rawMax - rawMin) * 0.1 || 5;
  const minW = rawMin - pad;
  const maxW = rawMax + pad;

  const toX = (i: number) => PL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
  const toY = (w: number) => PT + ((maxW - w) / (maxW - minW)) * chartH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.weight) }));

  // Smooth line using cubic bezier
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    linePath += ` C ${cpX} ${prev.y} ${cpX} ${curr.y} ${curr.x} ${curr.y}`;
  }

  const areaPath =
    data.length === 1
      ? `M ${points[0].x} ${points[0].y} L ${points[0].x} ${PT + chartH} Z`
      : `${linePath} L ${points[points.length - 1].x} ${PT + chartH} L ${points[0].x} ${PT + chartH} Z`;

  const goalY = toY(goalWeight);
  const startY = toY(startWeight);

  // Y-axis ticks
  const yTickCount = 5;
  const yTicks: { val: number; y: number }[] = [];
  for (let i = 0; i <= yTickCount; i++) {
    const val = minW + ((maxW - minW) / yTickCount) * i;
    yTicks.push({ val: Math.round(val), y: toY(val) });
  }

  // X-axis labels: first, middle, last
  const xLabels: { label: string; x: number }[] = [];
  if (data.length === 1) {
    xLabels.push({ label: formatShortDate(data[0].date), x: toX(0) });
  } else {
    const indices = [0];
    if (data.length > 3) indices.push(Math.floor(data.length / 2));
    indices.push(data.length - 1);
    indices.forEach((idx) => {
      xLabels.push({ label: formatShortDate(data[idx].date), x: toX(idx) });
    });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {yTicks.map(({ val, y }) => (
        <g key={val}>
          <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#27272a" strokeWidth="1" />
          <text
            x={PL - 6}
            y={y + 4}
            fill="#52525b"
            fontSize="9"
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="end"
          >
            {val}
          </text>
        </g>
      ))}

      {/* Start line */}
      {startY >= PT && startY <= PT + chartH && (
        <g>
          <line
            x1={PL}
            y1={startY}
            x2={W - PR}
            y2={startY}
            stroke="#52525b"
            strokeWidth="1"
            strokeDasharray="3,4"
            opacity="0.4"
          />
          <text
            x={W - PR - 2}
            y={startY - 4}
            fill="#52525b"
            fontSize="7.5"
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="end"
            opacity="0.6"
          >
            START {startWeight}
          </text>
        </g>
      )}

      {/* Goal line */}
      <g>
        <line
          x1={PL}
          y1={goalY}
          x2={W - PR}
          y2={goalY}
          stroke="#facc15"
          strokeWidth="1.5"
          strokeDasharray="5,4"
          opacity="0.55"
        />
        <text
          x={W - PR - 2}
          y={goalY - 4}
          fill="#facc15"
          fontSize="7.5"
          fontFamily="'JetBrains Mono', monospace"
          textAnchor="end"
          opacity="0.8"
        >
          GOAL {goalWeight}
        </text>
      </g>

      {/* Area */}
      <path d={areaPath} fill="url(#wg)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#facc15"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {points.map((p, i) => (
        <circle
          key={data[i].date}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#09090b"
          stroke="#facc15"
          strokeWidth="2.5"
        />
      ))}

      {/* X labels */}
      {xLabels.map(({ label, x }) => (
        <text
          key={label + x}
          x={x}
          y={H - 8}
          fill="#52525b"
          fontSize="8.5"
          fontFamily="'JetBrains Mono', monospace"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
