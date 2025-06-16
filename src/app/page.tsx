
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, ShieldAlert, AlertTriangle, Activity, Wifi, WifiOff, BedDouble, Zap, ChevronDown, CheckCircle, XCircle, Leaf } from 'lucide-react';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { AlertContent, SensorReadings, DeviceControls } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper to get emoji status
const getEmojiStatus = (key: keyof SensorReadings, value: number | boolean, sensors: SensorReadings): string => {
  switch (key) {
    case 'temperature':
      return `${value}°C 🌡️`;
    case 'humidity':
      return `${value}% 💧`;
    case 'soilMoisture':
      return value < 10 ? `${value}% ⚠️🌱` : `${value}% 🌱`;
    case 'waterLevel':
      return `${value}% 🌊`;
    case 'ldrBrightness':
      return value > 500 ? 'Bright 💡' : 'Dim 💡';
    case 'flameDetected':
      return value ? 'Detected 🔥' : 'Safe ✅';
    case 'waterShortage':
      return value ? 'Shortage 🚱' : 'Available ✅';
    default:
      return '';
  }
};

export default function HomePage() {
  const { appData, loading, error } = useFirebaseData();
  const [alerts, setAlerts] = useState<AlertContent[]>([]);
  
  useEffect(() => {
    if (appData?.sensors) {
      const processAlerts = () => {
        const newAlerts: AlertContent[] = [];
        const currentSensors = appData.sensors;

        // Soil Moisture Alert: Critical if < 10%
        if (currentSensors.soilMoisture < 10) {
          newAlerts.push({
            id: 'soilMoistureLow_fallback', type: 'soilMoisture', title: 'Low Soil Moisture!',
            message: `Soil moisture is critically low (${currentSensors.soilMoisture}%). Immediate watering needed.`,
            timestamp: Date.now(), severity: 'critical',
          });
        }

        if (currentSensors.flameDetected) {
           newAlerts.push({
            id: 'flameDetected_fallback', type: 'flame', title: 'Flame Detected!',
            message: 'A flame has been detected! Take immediate action.',
            timestamp: Date.now(), severity: 'critical',
          });
        }
        
        if (currentSensors.waterShortage) {
          newAlerts.push({
            id: 'waterShortage_fallback', type: 'waterShortage', title: 'Water Shortage!',
            message: 'Water supply is critically low. Check your main water source.',
            timestamp: Date.now(), severity: 'critical',
          });
        }
        setAlerts(newAlerts.sort((a, b) => b.timestamp - a.timestamp)); // Sort by most recent
      };
      processAlerts();
    }
  }, [appData]);

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
            <AlertTriangle /> Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load dashboard data. Please check your connection or try again later.</p>
          {error && <p className="text-sm text-muted-foreground mt-2">{error.message}</p>}
        </CardContent>
      </Card>
    );
  }
  
  const sensors = appData.sensors;
  const devices = appData.devices;

  const mainDeviceKeys: (keyof DeviceControls)[] = ['light1', 'lightLDR', 'light2'];
  let onlineDevicesCount = 0;
  const deviceList: { id: keyof DeviceControls; name: string; status: LightStatus | number | undefined, icon: React.ElementType }[] = [];

  if (devices) {
    mainDeviceKeys.forEach(key => {
      if (key !== 'ldrIntensity') { // ldrIntensity is not a device to count as online/offline
        const isOnline = devices[key] && devices[key] !== 'off';
        if (isOnline) {
          onlineDevicesCount++;
        }
        let displayName = "Unknown Device";
        let icon = Lightbulb;
        if (key === 'light1') {displayName = "Living Room Light"; icon = Lightbulb;}
        else if (key === 'lightLDR') {displayName = "LDR Smart Light"; icon = Zap;}
        else if (key === 'light2') {displayName = "Bedroom Light"; icon = BedDouble;}

        deviceList.push({ id: key, name: displayName, status: devices[key], icon: icon });
      }
    });
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const getSeverityText = (severity: AlertContent['severity']) => {
    switch (severity) {
      case 'critical': return 'High';
      case 'warning': return 'Medium';
      case 'info': return 'Low';
      default: return 'Unknown';
    }
  };
  
  const getSeverityBadgeVariant = (severity: AlertContent['severity']): "default" | "destructive" | "secondary" | "outline" | null | undefined => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary'; // Using secondary for medium as yellow might not contrast well
      case 'info': return 'outline';
      default: return 'default';
    }
  };


  return (
    <div className="container mx-auto p-4 space-y-6">
      <motion.div initial="hidden" animate="visible" variants={cardVariants}>
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold font-headline text-primary">Welcome Home</h1>
            <p className="text-muted-foreground mt-1">Monitor and control your smart home devices.</p>
          </div>
           <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {onlineDevicesCount} / {mainDeviceKeys.filter(key => key !== 'ldrIntensity').length} Devices Online
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Device Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {deviceList.map(device => (
                  <DropdownMenuItem key={device.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <device.icon className={`w-4 h-4 ${device.status !== 'off' ? 'text-green-500' : 'text-muted-foreground'}`} />
                      {device.name}
                    </div>
                    <Badge variant={device.status !== 'off' ? 'default' : 'outline'} className={device.status !== 'off' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : ''}>
                      {device.status !== 'off' ? 'Online' : 'Offline'}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-destructive">
              <ShieldAlert /> Important Alerts
              <Badge variant="destructive" className="ml-2">{alerts.length}</Badge>
            </h2>
            <div className="grid gap-4 grid-cols-1">
              {alerts.map(alert => (
                <Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-destructive' : 'border-yellow-500'}`}>
                  <CardHeader className="py-4 px-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {alert.type === 'flame' ? <AlertTriangle className="text-destructive"/> : 
                           alert.type === 'soilMoisture' ? <Leaf className="text-destructive" /> : 
                           alert.type === 'waterShortage' ? <Zap className="text-destructive" /> : 
                           <Activity className={alert.severity === 'critical' ? 'text-destructive' : 'text-yellow-500'}/>}
                          {alert.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                        {getSeverityText(alert.severity)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 px-6">
                    <p>{alert.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Sensor Overview Section */}
        <motion.section variants={itemVariants} className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Sensor Status</h2>
          {sensors ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(Object.keys(sensors) as Array<keyof SensorReadings>).map(key => (
                <Card key={key} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70">
                  <CardHeader>
                    <CardTitle className="text-base capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold text-primary">
                    {getEmojiStatus(key, sensors[key], sensors)}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No sensor data available.</p>
          )}
        </motion.section>

        {/* Device Overview Section */}
        <motion.section variants={itemVariants} className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Device Controls</h2>
          {devices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className={devices.light1 !== "off" ? "text-yellow-400" : ""} /> Living Room Light
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl capitalize">State: <span className="font-semibold">{devices.light1}</span></p>
                <Progress value={devices.light1 === "on" ? 100 : devices.light1 === "auto" ? 50 : 0} className="mt-2 h-2" />
                <Link href="/devices">
                  <Button variant="outline" size="sm" className="mt-4">Manage</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className={devices.lightLDR !== "off" ? "text-yellow-400" : ""} /> LDR Smart Light
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl capitalize">State: <span className="font-semibold">{devices.lightLDR}</span></p>
                 <Progress value={devices.lightLDR === "on" ? 100 : devices.lightLDR === "auto" ? 50 : 0} className="mt-2 h-2" />
                <Link href="/devices">
                  <Button variant="outline" size="sm" className="mt-4">Manage</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <BedDouble className={devices.light2 !== "off" ? "text-yellow-400" : ""} /> Bedroom Light
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl capitalize">State: <span className="font-semibold">{devices.light2}</span></p>
                 <Progress value={devices.light2 === "on" ? 100 : devices.light2 === "auto" ? 50 : 0} className="mt-2 h-2" />
                <Link href="/devices">
                  <Button variant="outline" size="sm" className="mt-4">Manage</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          ) : (
             <p>No device data available.</p>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}

