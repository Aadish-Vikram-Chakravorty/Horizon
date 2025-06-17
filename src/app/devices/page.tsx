
"use client";

import React, { useState } from 'react';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle }  from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sun, AlertTriangle, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LightStatus } from '@/types';

export default function DevicesPage() {
  const { appData, loading, error, updateLightStatus } = useFirebaseData();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const handleLightToggle = async (lightId: 'light1' | 'light2' , newCheckedState: boolean) => {
    setIsLoading(prev => ({ ...prev, [lightId]: true }));
    try {
      await updateLightStatus(lightId, newCheckedState ? 'on' : 'off');
    } catch (err) {
      console.error(`Failed to update ${lightId}`, err);
      // Optionally show a toast error
    } finally {
      setIsLoading(prev => ({ ...prev, [lightId]: false }));
    }
  };

  const handleLDRModeChange = async (newMode: LightStatus) => {
    setIsLoading(prev => ({ ...prev, lightLDR: true }));
    try {
      await updateLightStatus('lightLDR', newMode);
    } catch (err) {
      console.error('Failed to update lightLDR mode', err);
    } finally {
      setIsLoading(prev => ({ ...prev, lightLDR: false }));
    }
  };

  const handleLDRHeaderSwitchToggle = async (newCheckedState: boolean) => {
    setIsLoading(prev => ({ ...prev, lightLDRSwitch: true }));
    const newMode = newCheckedState ? 'auto' : 'off'; // Switch ON defaults to Auto, OFF to Off
    try {
      await updateLightStatus('lightLDR', newMode);
    } catch (err) {
      console.error('Failed to update lightLDR via header switch', err);
    } finally {
      setIsLoading(prev => ({ ...prev, lightLDRSwitch: false }));
    }
  };

  if (loading && !appData) { // Show global loading only if appData isn't there yet
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error || !appData) {
    return (
       <Card className="m-auto mt-10 max-w-md border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle /> Error Loading Device Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load device data. Please check your connection or try again later.</p>
          {error && <p className="text-sm text-muted-foreground mt-2">{error.message}</p>}
        </CardContent>
      </Card>
    );
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  const devices = appData.devices;
  const sensors = appData.sensors;

  return (
    <motion.div 
      className="container mx-auto p-4 space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div>
        <motion.h2 variants={itemVariants} className="text-2xl font-semibold mb-4 flex items-center text-primary">
          <Lightbulb className="mr-3 h-6 w-6" />
          Manual Control Lights
        </motion.h2>
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Living Room Light Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <div className="flex items-center space-x-3">
                <Lightbulb className="h-8 w-8 text-yellow-500" />
                <div>
                  <CardTitle className="text-lg">Living Room Light</CardTitle>
                  <CardDescription className="capitalize">{devices.light1}</CardDescription>
                </div>
              </div>
              <Switch
                checked={devices.light1 === 'on'}
                onCheckedChange={(checked) => handleLightToggle('light1', checked)}
                disabled={isLoading['light1']}
                aria-label="Toggle Living Room Light"
              />
            </CardHeader>
          </Card>

          {/* Bedroom Light Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <div className="flex items-center space-x-3">
                <Lightbulb className="h-8 w-8 text-purple-500" />
                <div>
                  <CardTitle className="text-lg">Bedroom Light</CardTitle>
                  <CardDescription className="capitalize">{devices.light2}</CardDescription>
                </div>
              </div>
              <Switch
                checked={devices.light2 === 'on'}
                onCheckedChange={(checked) => handleLightToggle('light2', checked)}
                disabled={isLoading['light2']}
                aria-label="Toggle Bedroom Light"
              />
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      <div>
        <motion.h2 variants={itemVariants} className="text-2xl font-semibold mb-4 flex items-center text-primary">
          <Sun className="mr-3 h-6 w-6" />
          Smart Lighting System
        </motion.h2>
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auto Light (LDR Controlled) Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row justify-between items-center">
              <div className="flex items-center space-x-3">
                <Sun className="h-8 w-8 text-purple-500" />
                <div>
                  <CardTitle className="text-lg">Auto Light (LDR Controlled)</CardTitle>
                  <CardDescription className="capitalize">{devices.lightLDR}</CardDescription>
                </div>
              </div>
              <Switch
                checked={devices.lightLDR !== 'off'} // Active if 'on' or 'auto'
                onCheckedChange={handleLDRHeaderSwitchToggle}
                disabled={isLoading['lightLDRSwitch'] || isLoading['lightLDR']}
                aria-label="Toggle Auto Light System"
              />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex space-x-2 mt-2">
                {(['off', 'on', 'auto'] as LightStatus[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={devices.lightLDR === mode ? 'default' : 'outline'}
                    onClick={() => handleLDRModeChange(mode)}
                    disabled={isLoading['lightLDR'] || isLoading['lightLDRSwitch']}
                    className="flex-1 capitalize"
                  >
                    {isLoading['lightLDR'] && devices.lightLDR === mode ? <LoadingSpinner size={16} className="mr-2" /> : null}
                    {mode}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LDR Light Info Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8 text-purple-500" />
                <div>
                  <CardTitle className="text-lg">LDR Light Info</CardTitle>
                  <CardDescription>Light-dependent resistor control</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current Brightness:</span>
                <span className="font-medium text-primary">{sensors.ldrBrightness}{typeof sensors.ldrBrightness === 'number' ? '%' : ''}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mode:</span>
                <Badge variant={devices.lightLDR === 'auto' ? 'default' : 'secondary'} className="capitalize">
                  {devices.lightLDR}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Auto Threshold:</span>
                <span className="font-medium text-muted-foreground">&lt; 30% (example)</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
