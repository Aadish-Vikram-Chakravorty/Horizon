
"use client";

import React from 'react';
import LightControl from '@/components/devices/LightControl';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle }  from '@/components/ui/card';
import { Lightbulb, Zap, AlertTriangle, BedDouble } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DevicesPage() {
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
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold font-headline text-primary mb-8">Device Management</h1>
      {appData.devices ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <LightControl
            lightId="light1"
            displayName="Living Room Light"
            icon={Lightbulb}
            showAutoOption={false} 
          />
          <LightControl
            lightId="lightLDR"
            displayName="LDR Smart Light"
            icon={Zap} 
            showAutoOption={true}
            hideIntensitySlider={true} // Hide the linear slider
            showDisplayOnlyRadialIntensity={true} // Show the new radial display
          />
          <LightControl
            lightId="light2" 
            displayName="Bedroom Light" 
            icon={BedDouble} 
            showAutoOption={false} 
          />
        </motion.div>
      ) : (
        <p className="text-muted-foreground">No devices configured or data available.</p>
      )}
    </div>
  );
}

