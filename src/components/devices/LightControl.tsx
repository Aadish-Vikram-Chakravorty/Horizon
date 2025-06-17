
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { LightStatus, DeviceControls } from '@/types';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface LightControlProps {
  lightId: Exclude<keyof DeviceControls, 'ldrIntensity'>;
  displayName: string;
  icon?: React.ElementType;
  showAutoOption?: boolean;
  disableStatusControls?: boolean; 
  hideIntensitySlider?: boolean;  
  showDisplayOnlyRadialIntensity?: boolean; // New prop
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


const LightControl: React.FC<LightControlProps> = ({
  lightId,
  displayName,
  icon: Icon,
  showAutoOption = true,
  disableStatusControls = false,
  hideIntensitySlider = false,
  showDisplayOnlyRadialIntensity = false, // Default to false
}) => {
  const { appData, updateLightStatus, updateLDRIntensity } = useFirebaseData();

  const currentStatus = appData?.devices?.[lightId] || 'off';
  const ldrIntensity = appData?.devices?.ldrIntensity ?? 50;

  const [selectedStatus, setSelectedStatus] = useState<LightStatus>(currentStatus);
  const [selectedIntensity, setSelectedIntensity] = useState<number>(ldrIntensity);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  useEffect(() => {
    setSelectedIntensity(ldrIntensity);
  }, [ldrIntensity]);

  const handleStatusChange = async (newStatus: LightStatus) => {
    if (disableStatusControls) return;
    setSelectedStatus(newStatus);
    setIsUpdating(true);
    try {
      await updateLightStatus(lightId, newStatus);
      toast({
        title: "Device Updated",
        description: `${displayName} status set to ${newStatus.toUpperCase()}.`,
      });
    } catch (error) {
      console.error(`Failed to update ${lightId}:`, error);
      setSelectedStatus(currentStatus); // Revert on error
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `Could not update ${displayName}. Please try again.`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIntensityChange = (newIntensity: number[]) => {
    if (disableStatusControls && !showDisplayOnlyRadialIntensity) return; // Only allow if not display-only radial
    setSelectedIntensity(newIntensity[0]);
  };

  const handleIntensityCommit = async (newIntensity: number[]) => {
    if (disableStatusControls && !showDisplayOnlyRadialIntensity) return; // Only allow if not display-only radial
    setIsUpdating(true);
    try {
      await updateLDRIntensity(newIntensity[0]);
      toast({
        title: "Device Updated",
        description: `${displayName} intensity set to ${newIntensity[0]}%.`,
      });
    } catch (error) {
      console.error(`Failed to update ${lightId} intensity:`, error);
      setSelectedIntensity(ldrIntensity); // Revert on error
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `Could not update ${displayName} intensity.`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const DefaultIcon = lightId === 'lightLDR' ? Zap : Lightbulb;
  const EffectiveIcon = Icon || DefaultIcon;

  const availableStatuses: LightStatus[] = ['on', 'off'];
  if (showAutoOption) {
    availableStatuses.push('auto');
  }

  const majorTicks = [0, 25, 50, 75, 100];
  const minorTickIncrement = 5;
  const numMinorTicks = 100 / minorTickIncrement;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70 w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              key={currentStatus} // Re-animate icon on status change
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <EffectiveIcon className={`w-6 h-6 ${currentStatus !== 'off' ? 'text-yellow-400' : 'text-muted-foreground'}`} />
            </motion.div>
            {displayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedStatus}
            onValueChange={(value: string) => handleStatusChange(value as LightStatus)}
            className="flex space-x-2 sm:space-x-4 mb-4"
            aria-label={`Control ${displayName}`}
            disabled={isUpdating || disableStatusControls}
          >
            {availableStatuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <RadioGroupItem value={status} id={`${lightId}-${status}`} disabled={isUpdating || disableStatusControls} />
                <Label htmlFor={`${lightId}-${status}`} className="capitalize cursor-pointer">
                  {status}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <AnimatePresence>
            {lightId === 'lightLDR' && selectedStatus === 'on' && (
              <>
                {showDisplayOnlyRadialIntensity ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center space-y-2 mt-4"
                  >
                    <Label htmlFor={`${lightId}-radial-intensity`} className="text-sm font-medium text-muted-foreground">
                      Intensity (Display Only)
                    </Label>
                    <div className="relative w-40 h-40"> {/* Increased size for better visibility */}
                      <svg viewBox="0 0 120 120" className="transform -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="hsl(var(--muted))" strokeWidth="10" />
                        <path
                          d={describeArc(60, 60, 50, 0, (selectedIntensity / 100) * 359.99)}
                          fill="transparent"
                          stroke="hsl(var(--primary))"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        {/* Minor Ticks */}
                        {Array.from({ length: numMinorTicks }).map((_, i) => {
                          const val = i * minorTickIncrement;
                          if (val % 25 === 0 && val !== 0 && val !== 100) return null; // Skip if it's a major tick (except 0 and 100 for explicit drawing)
                          const angle = (val / 100) * 360;
                          const start = polarToCartesian(60, 60, 46, angle); // Slightly inside the main arc
                          const end = polarToCartesian(60, 60, 50, angle);
                          return (
                            <line
                              key={`minor-${i}`}
                              x1={start.x}
                              y1={start.y}
                              x2={end.x}
                              y2={end.y}
                              stroke="hsl(var(--border))"
                              strokeWidth="1.5"
                            />
                          );
                        })}
                         {/* Major Ticks and Labels */}
                        {majorTicks.map(val => {
                          const angle = (val / 100) * 360;
                          const tickStart = polarToCartesian(60, 60, 44, angle); // Longer ticks
                          const tickEnd = polarToCartesian(60, 60, 50, angle);
                          const labelPos = polarToCartesian(60, 60, 36, angle); // Position for labels

                          return (
                            <React.Fragment key={`major-${val}`}>
                              <line
                                x1={tickStart.x}
                                y1={tickStart.y}
                                x2={tickEnd.x}
                                y2={tickEnd.y}
                                stroke="hsl(var(--foreground))"
                                strokeWidth="2"
                              />
                              <text
                                x={labelPos.x}
                                y={labelPos.y}
                                dy="0.35em" // Center text vertically
                                textAnchor="middle"
                                fontSize="10"
                                fill="hsl(var(--foreground))"
                                className="transform-none" // Keep text upright
                              >
                                {val}
                              </text>
                            </React.Fragment>
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-primary">
                        {selectedIntensity}%
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  !hideIntensitySlider && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 pt-2"
                    >
                      <Label htmlFor={`${lightId}-intensity`} className="flex items-center gap-2 text-sm font-medium">
                        <SlidersHorizontal className="w-4 h-4 text-muted-foreground" /> Intensity: {selectedIntensity}%
                      </Label>
                      <Slider
                        id={`${lightId}-intensity`}
                        min={0}
                        max={100}
                        step={1}
                        value={[selectedIntensity]}
                        onValueChange={handleIntensityChange}
                        onValueCommit={handleIntensityCommit}
                        disabled={isUpdating || disableStatusControls}
                        className="w-full"
                      />
                    </motion.div>
                  )
                )}
              </>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter>
          {isUpdating && <p className="text-sm text-muted-foreground">Updating...</p>}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LightControl;
