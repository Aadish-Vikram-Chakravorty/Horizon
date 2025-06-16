
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

  const bulbVariants = {
    on: {
      backgroundColor: "rgba(250, 204, 21, 1)", 
      borderColor: "rgba(234, 179, 8, 1)", 
      boxShadow: "0 0 20px 8px rgba(250, 204, 21, 0.6)",
      scale: 1.03,
    },
    off: {
      backgroundColor: "rgba(209, 213, 219, 1)", 
      borderColor: "rgba(156, 163, 175, 1)", 
      boxShadow: "none",
      scale: 1,
    },
  };

  const darkBulbVariants = {
    on: {
      backgroundColor: "rgba(250, 204, 21, 1)",
      borderColor: "rgba(234, 179, 8, 1)",
      boxShadow: "0 0 20px 8px rgba(250, 204, 21, 0.6)",
      scale: 1.03,
    },
    off: {
      backgroundColor: "rgba(75, 85, 99, 1)", 
      borderColor: "rgba(107, 114, 128, 1)", 
      boxShadow: "none",
      scale: 1,
    },
  };

  const rayVariants = {
    hidden: { opacity: 0, scaleY: 0.3, y: 8 },
    visible: (i: number) => ({
      opacity: 1,
      scaleY: 1,
      y: 0,
      transition: { delay: i * 0.02, duration: 0.15, ease: "easeOut" },
    }),
    exit: { opacity: 0, scaleY: 0, y: 8, transition: { duration: 0.12 } },
  };

  const getBulbAnimationState = () => {
    return currentStatus === 'on' ? "on" : "off";
  }

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[180px] pt-2 pb-4 text-center", className)}>
      <div className="flex items-center gap-2 mb-3 text-card-foreground">
        <IconComponent className="w-5 h-5 text-primary" />
        <span className="font-medium">{displayName}</span>
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
        <div className="h-6 w-0.5 bg-gray-500 dark:bg-gray-400 mb-[-1px] z-10 group-hover:bg-primary transition-colors"></div>
        <motion.div
          className="relative w-12 h-12 rounded-full" // Removed border-2 from here
          transition={{ duration: 0.2, ease: "circOut" }}
          animate={getBulbAnimationState()} 
        >
          <div className="dark:hidden">
            <motion.div
              className="w-full h-full rounded-full border-2" // Added border-2 here
              variants={bulbVariants}
              animate={getBulbAnimationState()}
              transition={{ duration: 0.2, ease: "circOut" }}
            />
          </div>
          <div className="hidden dark:block">
            <motion.div
              className="w-full h-full rounded-full border-2" // Added border-2 here
              variants={darkBulbVariants}
              animate={getBulbAnimationState()}
              transition={{ duration: 0.2, ease: "circOut" }}
            />
          </div>
          <AnimatePresence>
            {currentStatus === 'on' && !isUpdating && ( 
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-[3px] h-12 origin-center"
                    style={{
                      backgroundColor: 'rgba(250, 204, 21, 0.55)', 
                      transform: `rotate(${i * 30}deg) translateY(-22px)`,
                      borderRadius: '3px',
                    }}
                    custom={i}
                    variants={rayVariants}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedLightControl;
