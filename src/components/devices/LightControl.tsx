
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
}

const LightControl: React.FC<LightControlProps> = ({ lightId, displayName, icon: Icon, showAutoOption = true }) => {
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
      setSelectedStatus(currentStatus); 
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
    setSelectedIntensity(newIntensity[0]);
  };
  
  const handleIntensityCommit = async (newIntensity: number[]) => {
    setIsUpdating(true);
    try {
      await updateLDRIntensity(newIntensity[0]);
      toast({
        title: "Device Updated",
        description: `${displayName} intensity set to ${newIntensity[0]}%.`,
      });
    } catch (error) {
      console.error(`Failed to update ${lightId} intensity:`, error);
      setSelectedIntensity(ldrIntensity); 
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
              key={currentStatus} 
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
            disabled={isUpdating}
          >
            {availableStatuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <RadioGroupItem value={status} id={`${lightId}-${status}`} />
                <Label htmlFor={`${lightId}-${status}`} className="capitalize cursor-pointer">
                  {status}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <AnimatePresence>
            {lightId === 'lightLDR' && selectedStatus === 'on' && (
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
                  disabled={isUpdating}
                  className="w-full"
                />
              </motion.div>
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
