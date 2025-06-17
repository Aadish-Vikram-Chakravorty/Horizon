
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DisplayOnlyRadialGaugeProps {
  value: number;
  label?: string;
  min?: number;
  max?: number;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

// Helper functions for SVG arc
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);
  var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  var d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  return d;
}

const DisplayOnlyRadialGauge: React.FC<DisplayOnlyRadialGaugeProps> = ({
  value,
  label,
  min = 0,
  max = 100,
  unit = '%',
  size = 160,
  strokeWidth = 10,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const center = size / 2;

  const majorTickValues = [0, 25, 50, 75, 100];
  const minorTickIncrement = 5;
  const numMinorTicks = max / minorTickIncrement; // Total potential minor ticks up to max

  return (
    <motion.div
      className={cn("flex flex-col items-center", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Value arc - starts from 0 degrees (top) and goes clockwise */}
          <motion.path
            d={describeArc(center, center, radius, 0, normalizedValue * 359.99)} 
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: normalizedValue }}
            transition={{ duration: 1, ease: "circOut" }}
          />

          {/* Minor Ticks */}
          {Array.from({ length: numMinorTicks }).map((_, i) => {
            const tickVal = (i + 1) * minorTickIncrement;
            // Skip if it's exactly a major tick value or exceeds max (though max is handled by numMinorTicks)
            if (tickVal >= max || majorTickValues.includes(tickVal)) return null; 
            
            const angle = (tickVal / max) * 360;
            const start = polarToCartesian(center, center, radius - strokeWidth / 2 + 2, angle);
            const end = polarToCartesian(center, center, radius + strokeWidth / 2 - 2, angle);
            return (
              <line
                key={`minor-${i}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
            );
          })}

          {/* Major Ticks (Lines Only) */}
          {majorTickValues.map(val => {
            const angle = (val / max) * 360;
            // Make major ticks slightly longer or more prominent
            const tickStartOuter = polarToCartesian(center, center, radius - strokeWidth / 2, angle);
            const tickEndOuter = polarToCartesian(center, center, radius + strokeWidth / 2, angle);

            return (
              <React.Fragment key={`major-line-${val}`}>
                <line
                  x1={tickStartOuter.x}
                  y1={tickStartOuter.y}
                  x2={tickEndOuter.x}
                  y2={tickEndOuter.y}
                  stroke="hsl(var(--foreground))" 
                  strokeWidth="2" 
                />
              </React.Fragment>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-primary">
            {value.toFixed(0)}
            {unit && <span className="text-base ml-0.5">{unit}</span>}
          </span>
        </div>
      </div>
      {label && <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>}
    </motion.div>
  );
};

export default DisplayOnlyRadialGauge;
