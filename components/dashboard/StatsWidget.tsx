import { clsx } from 'clsx';

interface StatWidgetProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: 'cyan' | 'green' | 'amber' | 'red';
  icon?: React.ReactNode;
}

const colorMap = {
  cyan: 'text-neon-cyan',
  green: 'text-neon-green',
  amber: 'text-neon-amber',
  red: 'text-neon-red',
};

export function StatsWidget({ label, value, sublabel, color = 'cyan', icon }: StatWidgetProps) {
  return (
    <div className="forge-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
        {icon && <span className="text-gray-600">{icon}</span>}
      </div>
      <div className={clsx('text-3xl font-black tabular-nums', colorMap[color])}>
        {value}
      </div>
      {sublabel && (
        <p className="text-xs text-gray-600 mt-1.5">{sublabel}</p>
      )}
    </div>
  );
}
