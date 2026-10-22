import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  label,
  subLabel,
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center flex-col"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progress percentage'}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-800 fill-none"
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-teal-500 dark:stroke-teal-400 fill-none transition-all duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {clamped}%
        </span>
        {subLabel && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
            {subLabel}
          </span>
        )}
      </div>
      <span className="sr-only">
        {label || 'Academic completion rate'}: {clamped}% complete
      </span>
    </div>
  );
};
