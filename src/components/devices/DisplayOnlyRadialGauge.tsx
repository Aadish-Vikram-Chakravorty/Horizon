
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
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0; // -90 degrees to start from top
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  var start = polarToCartesian(x, y, radius, startAngle); // Point to Move to
  var end = polarToCartesian(x, y, radius, endAngle);     // Point to Arc to

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  var sweepFlag = "1"; // 1 for clockwise

  // Ensure endAngle doesn't exactly equal startAngle if trying to draw a full circle from 0 to 360,
  // as that can cause rendering issues. A value very close to 360 is preferred for a full segment.
  // However, for partial arcs, if endAngle is truly 0 (for a 0 value), start and end points will be the same.
  if (startAngle === 0 && endAngle >= 359.99) { // Covers the full circle case explicitly for a complete segment
    endAngle = 359.999; // Prevents closing the path in a way that makes it disappear
  }


  var d = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
  ].join(" ");

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

  // Calculate the end angle for the arc. 359.99 to avoid issues with full 360.
  // For a value of 0, the arc should have an endAngle of 0.
  const valueArcEndAngle = normalizedValue === 0 ? 0 : normalizedValue * 359.99;


  const majorTickValues = [0, 25, 50, 75, 100];
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
          {/* Value arc - starts from 0 degrees (top) and goes clockwise */}
          {normalizedValue > 0 && ( // Only render path if there's a value to show
            <motion.path
              d={describeArc(center, center, radius, 0, valueArcEndAngle)}
              stroke="hsl(var(--primary))"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="butt" // Changed from "round" to "butt"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: normalizedValue }} // Animate based on the normalized value
              transition={{ duration: 1, ease: "circOut" }}
            />
          )}

          {/* Minor Ticks */}
          {Array.from({ length: numMinorTicks }).map((_, i) => {
            const tickVal = (i + 1) * minorTickIncrement;
            // Skip minor ticks that coincide with major ticks, unless it's the 0 or 100 mark if you want them explicit.
            // Here, we assume major ticks handle their own drawing.
            if (majorTickValues.includes(tickVal) && tickVal !== 0 && tickVal !== max) return null; 
            if (tickVal > max) return null; // Don't draw ticks beyond max
            
            const angle = (tickVal / max) * 360;
            // Adjust tick length if needed. These start/end points make them cross the center of the track.
            const start = polarToCartesian(center, center, radius - strokeWidth / 2 + 2, angle);
            const end = polarToCartesian(center, center, radius + strokeWidth / 2 - 2, angle);
            return (
              <line
                key={`minor-${i}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="hsl(var(--border))" // Color for minor ticks
                strokeWidth="1" // Thickness for minor ticks
              />
            );
          })}

          {/* Major Ticks (Lines Only) */}
          {majorTickValues.map(val => {
            const angle = (val / max) * 360;
            // Make major ticks slightly longer or more prominent than minor ones
            const tickStartOuter = polarToCartesian(center, center, radius - strokeWidth / 2, angle);
            const tickEndOuter = polarToCartesian(center, center, radius + strokeWidth / 2, angle);

            return (
              <React.Fragment key={`major-line-${val}`}>
                <line
                  x1={tickStartOuter.x}
                  y1={tickStartOuter.y}
                  x2={tickEndOuter.x}
                  y2={tickEndOuter.y}
                  stroke="hsl(var(--foreground))" // Color for major ticks (e.g., white in dark mode)
                  strokeWidth="2" // Thickness for major ticks
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
