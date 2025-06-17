
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
  size = 160, // Slightly smaller default for embedding
  strokeWidth = 10,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const offset = circumference * (1 - normalizedValue);
  const center = size / 2;

  const majorTicks = [0, 25, 50, 75, 100];
  const minorTickIncrement = 5;
  const numMinorTicks = max / minorTickIncrement;

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
          {/* Value arc */}
          <motion.path
            d={describeArc(center, center, radius, 0, normalizedValue * 359.99)} // Use path for open arc
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
            if (tickVal >= max || majorTicks.includes(tickVal)) return null; // Skip if it's a major tick or exceeds max
            const angle = (tickVal / max) * 360;
            const start = polarToCartesian(center, center, radius - strokeWidth / 2 + 1, angle);
            const end = polarToCartesian(center, center, radius + strokeWidth / 2 - 1, angle);
            return (
              <line
                key={`minor-${i}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                transform={`rotate(90 ${center} ${center})`} // Correct rotation for ticks
              />
            );
          })}

          {/* Major Ticks and Labels */}
          {majorTicks.map(val => {
            const angle = (val / max) * 360;
            const tickStartOuter = polarToCartesian(center, center, radius + strokeWidth / 2, angle);
            const tickEndOuter = polarToCartesian(center, center, radius + strokeWidth / 2 - 5, angle); // Length of major tick
            const labelPos = polarToCartesian(center, center, radius - strokeWidth /2 - 10, angle); // Position for labels

            return (
              <React.Fragment key={`major-${val}`}>
                <line
                  x1={tickStartOuter.x}
                  y1={tickStartOuter.y}
                  x2={tickEndOuter.x}
                  y2={tickEndOuter.y}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                  transform={`rotate(90 ${center} ${center})`} // Correct rotation for ticks
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  dy="0.35em"
                  textAnchor="middle"
                  fontSize="10"
                  fill="hsl(var(--foreground))"
                  transform={`rotate(${angle} ${labelPos.x} ${labelPos.y}) rotate(90 ${center} ${center})`} // Rotate label with tick, then counter-rotate text part if needed (complex)
                  // Simpler: keep labels upright relative to viewer, adjust positioning
                  // For simplicity, direct text rendering, may need fine-tuning
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  transform={`rotate(${angle} ${labelPos.x} ${labelPos.y})`}
                >
                <tspan transform={`rotate(${-angle} ${labelPos.x} ${labelPos.y})`}>
                  {val}
                </tspan>
                </text>
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
