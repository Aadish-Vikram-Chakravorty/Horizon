"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SensorGaugeProps {
  label: string;
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  icon?: React.ElementType;
  valueColor?: string; // Optional: specific color for the value arc
  className?: string;
}

const SensorGauge: React.FC<SensorGaugeProps> = ({
  label,
  value,
  unit = '',
  min = 0,
  max = 100,
  size = 150,
  strokeWidth = 12,
  icon: Icon,
  valueColor,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Normalize value to 0-1 range for progress calculation
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const offset = circumference * (1 - normalizedValue);

  const center = size / 2;

  return (
    <motion.div
      className={cn("flex flex-col items-center p-4 rounded-lg shadow-md bg-card text-card-foreground border border-border/70", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px hsla(var(--primary)/0.2)"}}
    >
      {Icon && <Icon className="w-6 h-6 mb-2 text-primary" />}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
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
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            stroke={valueColor || "hsl(var(--primary))"}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            custom={normalizedValue}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - normalizedValue) }}
            transition={{ duration: 1, ease: "circOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : value.toFixed(value % 1 === 0 ? 0 : 1)}
            {typeof value !== 'boolean' && unit && <span className="text-sm ml-1">{unit}</span>}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-center text-muted-foreground">{label}</p>
    </motion.div>
  );
};

export default SensorGauge;
