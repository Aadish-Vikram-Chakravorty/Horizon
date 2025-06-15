"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { LightStatus, DeviceControls } from '@/types';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface LightControlProps {
  lightId: keyof DeviceControls;
  displayName: string;
  icon?: React.ElementType;
}

const LightControl: React.FC<LightControlProps> = ({ lightId, displayName, icon: Icon }) => {
  const { appData, updateLightStatus } = useFirebaseData();
  const currentStatus = appData?.devices?.[lightId] || 'off';
  const [selectedStatus, setSelectedStatus] = useState<LightStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = async (newStatus: LightStatus) => {
    setSelectedStatus(newStatus); // Optimistic update for UI responsiveness
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

  const DefaultIcon = lightId === 'lightLDR' ? Zap : Lightbulb;
  const EffectiveIcon = Icon || DefaultIcon;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EffectiveIcon className={`w-6 h-6 ${currentStatus !== 'off' ? 'text-yellow-400' : 'text-muted-foreground'}`} />
          {displayName}
        </CardTitle>
        <CardDescription>Current status: <span className="font-semibold capitalize">{currentStatus}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedStatus}
          onValueChange={(value: string) => handleStatusChange(value as LightStatus)}
          className="flex space-x-2 sm:space-x-4"
          aria-label={`Control ${displayName}`}
          disabled={isUpdating}
        >
          {(['on', 'off', 'auto'] as LightStatus[]).map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <RadioGroupItem value={status} id={`${lightId}-${status}`} />
              <Label htmlFor={`${lightId}-${status}`} className="capitalize cursor-pointer">
                {status}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        {isUpdating && <p className="text-sm text-muted-foreground">Updating...</p>}
      </CardFooter>
    </Card>
    </motion.div>
  );
};

export default LightControl;
