'use client';

import { useEffect, useState } from 'react';

interface HealthScoreGaugeProps {
  score: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#39ff14';
  if (score >= 60) return '#ffb700';
  if (score >= 40) return '#ff8c00';
  return '#ff2d55';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excelente';
  if (score >= 75) return 'Bueno';
  if (score >= 60) return 'Regular';
  if (score >= 40) return 'Deficiente';
  return 'Crítico';
}

export function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, score);
      setAnimatedScore(Math.round(current));
      if (current >= score) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);

  const radius = 90;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Solo 270 grados del círculo (3/4)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (animatedScore / 100) * arcLength;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 220 220" className="w-full h-full -rotate-[135deg]">
          {/* Track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: 'stroke-dashoffset 0.1s linear',
            }}
          />
        </svg>

        {/* Centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-black tabular-nums"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="text-xs text-gray-500 mt-1">/ 100</span>
        </div>
      </div>

      <div className="text-center mt-1">
        <p className="text-lg font-bold" style={{ color }}>
          {label}
        </p>
        <p className="text-xs text-gray-500">Score de Salud del Sitio</p>
      </div>
    </div>
  );
}
