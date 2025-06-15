"use client";

import React from 'react';
import SensorGauge from '@/components/sensors/SensorGauge';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets, Waves, Zap, Flame, Leaf, Sun, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SensorsPage() {
  const { appData, loading, error } = useFirebaseData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error || !appData) {
    return (
      <Card className="m-auto mt-10 max-w-md border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle /> Error Loading Sensor Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load sensor data. Please check your connection or try again later.</p>
          {error && <p className="text-sm text-muted-foreground mt-2">{error.message}</p>}
        </CardContent>
      </Card>
    );
  }

  const { sensors } = appData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold font-headline text-primary mb-8">Sensor Readings</h1>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <SensorGauge
          label="Temperature"
          value={sensors.temperature}
          unit="°C"
          min={-10}
          max={50}
          icon={Thermometer}
          valueColor={sensors.temperature > 30 ? "hsl(var(--destructive))" : sensors.temperature < 10 ? "hsl(var(--accent))" : "hsl(var(--primary))"}
        />
        <SensorGauge
          label="Humidity"
          value={sensors.humidity}
          unit="%"
          icon={Droplets}
        />
        <SensorGauge
          label="LDR Brightness"
          value={sensors.ldrBrightness} // Assuming 0-1023 range from typical LDRs
          unit="lux" // Can be unitless or lux depending on calibration
          min={0}
          max={1023} // Common raw LDR range
          icon={Sun}
        />
        <SensorGauge
          label="Water Level"
          value={sensors.waterLevel}
          unit="%"
          icon={Waves}
        />
        <SensorGauge
          label="Soil Moisture"
          value={sensors.soilMoisture} // higher value means wetter
          unit="%"
          icon={Leaf}
          valueColor={sensors.soilMoisture < 10 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
        />
        <SensorGauge
          label="Flame Detected"
          value={sensors.flameDetected ? 1 : 0} // Map boolean to 0 or 1 for gauge display
          min={0}
          max={1}
          icon={Flame}
          valueColor={sensors.flameDetected ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
        />
         <SensorGauge
          label="Water Shortage"
          value={sensors.waterShortage ? 1 : 0} // Map boolean to 0 or 1
          min={0}
          max={1}
          icon={Zap} // Using Zap as a generic "status" icon
          valueColor={sensors.waterShortage ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
        />
      </motion.div>
    </div>
  );
}
