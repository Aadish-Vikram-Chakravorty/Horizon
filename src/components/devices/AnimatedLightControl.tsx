
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Icon as LucideIcon } from 'lucide-react';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import type { LightStatus } from '@/types';
import { cn } from '@/lib/utils';

interface AnimatedLightControlProps {
  lightId: 'light1' | 'light2'; 
  displayName: string;
  IconComponent: LucideIcon;
  className?: string;
}

const AnimatedLightControl: React.FC<AnimatedLightControlProps> = ({
  lightId,
  displayName,
  IconComponent,
  className,
}) => {
  const { appData, updateLightStatus } = useFirebaseData();
  const [isUpdating, setIsUpdating] = useState(false);

  const lightData = appData?.devices;
  const currentStatus = lightData?.[lightId] ?? 'off';

  const handleLightToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newStatus: LightStatus = currentStatus === 'on' ? 'off' : 'on';
    try {
      await updateLightStatus(lightId, newStatus);
    } catch (err) {
      console.error(`Failed to update ${lightId}`, err);
    } finally {
      setIsUpdating(false);
    }
  };

  const lightBarVariants = {
    on: {
      backgroundColor: "rgba(250, 204, 21, 1)", // Bright yellow
      borderColor: "rgba(234, 179, 8, 1)", 
      boxShadow: "0 0 30px 12px rgba(250, 204, 21, 1)", // Much brighter yellow glow, alpha set to 1
      scale: 1.03,
    },
    off: {
      backgroundColor: "rgba(209, 213, 219, 1)", // neutral gray
      borderColor: "rgba(156, 163, 175, 1)", 
      boxShadow: "none",
      scale: 1,
    },
  };

  const darkLightBarVariants = {
    on: {
      backgroundColor: "rgba(250, 204, 21, 1)", // Bright yellow for dark mode too
      borderColor: "rgba(234, 179, 8, 1)", 
      boxShadow: "0 0 30px 12px rgba(250, 204, 21, 1)", // Much brighter yellow glow, alpha set to 1
      scale: 1.03,
    },
    off: {
      backgroundColor: "rgba(75, 85, 99, 1)", // darker gray for dark mode off
      borderColor: "rgba(107, 114, 128, 1)", 
      boxShadow: "none",
      scale: 1,
    },
  };
  
  const stringVariants = {
    on: { backgroundColor: "hsl(var(--primary))" },
    off: { backgroundColor: "hsl(var(--muted-foreground))" }
  }

  const getLightAnimationState = () => {
    return currentStatus === 'on' ? "on" : "off";
  }

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[180px] pt-2 pb-4 text-center", className)}>
      <div className="flex items-center justify-center gap-2 mb-3 text-card-foreground">
        <IconComponent className="w-5 h-5 text-primary" />
        <span className="font-medium text-base">{displayName}</span>
      </div>
      <motion.div
        className="relative flex flex-col items-center cursor-pointer group"
        onClick={handleLightToggle}
        whileTap={isUpdating ? {} : { scale: 0.92, transition: {duration: 0.1} }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (isUpdating) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLightToggle();
          }
        }}
        aria-pressed={currentStatus === 'on'}
        aria-label={`Toggle ${displayName} ${currentStatus === 'on' ? 'off' : 'on'}`}
      >
        <motion.div 
          className="h-10 w-0.5 mb-[-1px] z-10 group-hover:bg-primary transition-colors"
          variants={stringVariants}
          animate={getLightAnimationState()}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className="relative w-16 h-3 rounded-md border" // Horizontal bar shape
          transition={{ duration: 0.2, ease: "circOut" }}
          animate={getLightAnimationState()} 
        >
          <div className="dark:hidden">
            <motion.div
              className="w-full h-full rounded-md"
              variants={lightBarVariants}
              animate={getLightAnimationState()}
              transition={{ duration: 0.2, ease: "circOut" }}
            />
          </div>
          <div className="hidden dark:block">
            <motion.div
              className="w-full h-full rounded-md"
              variants={darkLightBarVariants}
              animate={getLightAnimationState()}
              transition={{ duration: 0.2, ease: "circOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedLightControl;
