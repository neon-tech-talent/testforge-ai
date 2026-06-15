import { clsx } from 'clsx';

interface NeonBorderProps {
  children: React.ReactNode;
  color?: 'cyan' | 'green' | 'amber' | 'red' | 'purple';
  className?: string;
  animate?: boolean;
}

const colorMap = {
  cyan: 'border-neon-cyan shadow-neon-cyan',
  green: 'border-neon-green shadow-neon-green',
  amber: 'border-neon-amber shadow-neon-amber',
  red: 'border-neon-red shadow-neon-red',
  purple: 'border-[#bf5af2] shadow-[0_0_10px_#bf5af2]',
};

export function NeonBorder({ children, color = 'cyan', className, animate = false }: NeonBorderProps) {
  return (
    <div
      className={clsx(
        'border rounded-forge',
        colorMap[color],
        animate && 'border-animate',
        className
      )}
    >
      {children}
    </div>
  );
}
