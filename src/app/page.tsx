
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Lightbulb, ShieldAlert, AlertTriangle, Activity, WifiOff, BedDouble, Zap, ChevronDown, Leaf, Sofa } from 'lucide-react';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { AlertContent, SensorReadings, DeviceControls, LightStatus } from '@/types';
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
import AnimatedLightControl from '@/components/devices/AnimatedLightControl';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


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
      return String(value);
  }
};

export default function HomePage() {
  const { appData, loading, error, updateLightStatus } = useFirebaseData();
  const [alerts, setAlerts] = useState<AlertContent[]>([]);
  const [isUpdatingLightLDR, setIsUpdatingLightLDR] = useState(false);

  useEffect(() => {
    if (appData?.sensors) {
      const processAlerts = () => {
        const newAlerts: AlertContent[] = [];
        const currentSensors = appData.sensors;

        if (currentSensors.soilMoisture < 10) {
          newAlerts.push({
            id: 'soilMoistureLow_fallback', type: 'soilMoisture', title: 'Low Soil Moisture!',
            message: `Soil moisture is critically low (${currentSensors.soilMoisture}%). Immediate watering needed.`,
            timestamp: Date.now(), severity: 'critical',
          });
        } else if (currentSensors.soilMoisture < 20) {
            newAlerts.push({
            id: 'soilMoistureWarning_fallback', type: 'soilMoisture', title: 'Low Soil Moisture Warning',
            message: `Soil moisture is low (${currentSensors.soilMoisture}%). Consider watering soon.`,
            timestamp: Date.now(), severity: 'warning',
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
        setAlerts(newAlerts.sort((a, b) => b.timestamp - a.timestamp)); 
      };
      processAlerts();
    }
  }, [appData]);

  const handleLDRLightUpdate = async (newStatus: LightStatus) => {
    setIsUpdatingLightLDR(true);
    try {
      await updateLightStatus('lightLDR', newStatus);
    } catch (err) {
      console.error('Failed to update lightLDR', err);
      // Add toast error if needed
    } finally {
      setIsUpdatingLightLDR(false);
    }
  };
  
  const handleLDRSwitchChange = (checked: boolean) => {
    handleLDRLightUpdate(checked ? 'on' : 'off');
  };

  const handleLDRAutoToggle = () => {
    if (devices?.lightLDR === 'auto') {
      handleLDRLightUpdate('off'); 
    } else {
      handleLDRLightUpdate('auto'); 
    }
  };


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
      if (key !== 'ldrIntensity') { 
        const deviceStatus = devices[key];
        const isOnline = deviceStatus && (deviceStatus === 'on' || deviceStatus === 'auto');
        if (isOnline) {
          onlineDevicesCount++;
        }
        let displayName = "Unknown Device";
        let icon = Lightbulb;
        if (key === 'light1') {displayName = "Living Room Light"; icon = Sofa;}
        else if (key === 'lightLDR') {displayName = "LDR Smart Light"; icon = Zap;}
        else if (key === 'light2') {displayName = "Bedroom Light"; icon = BedDouble;}

        deviceList.push({ id: key, name: displayName, status: deviceStatus, icon: icon });
      }
    });
  }
  
  const onlineDeviceItems = deviceList.filter(device => device.status && (device.status === 'on' || device.status === 'auto'));


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
      case 'warning': return 'secondary'; 
      case 'info': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <motion.div initial="hidden" animate="visible" variants={cardVariants}>
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
                <DropdownMenuLabel>Online Devices</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onlineDeviceItems.length > 0 ? (
                  onlineDeviceItems.map(device => (
                    <DropdownMenuItem key={device.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <device.icon className={`w-4 h-4 text-green-500`} />
                        {device.name}
                      </div>
                      <Badge variant={'default'} className={'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100'}>
                        {typeof device.status === 'string' ? device.status.toUpperCase() : 'Online'}
                      </Badge>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No devices online</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      
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

        <motion.section variants={itemVariants} className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Device Controls</h2>
          {devices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70">
              <AnimatedLightControl
                lightId="light1"
                displayName="Living Room Light"
                IconComponent={Sofa}
              />
               <CardFooter className="justify-center pb-3 pt-0">
                 <Link href="/devices">
                   <Button variant="link" size="sm" className="text-xs px-0">Advanced Settings</Button>
                 </Link>
               </CardFooter>
            </Card>
            
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className={(devices.lightLDR === "on" || devices.lightLDR === "auto") ? "text-yellow-400" : ""} /> LDR Smart Light
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 justify-center">
                  <span className={cn(
                    "text-sm select-none", 
                    devices.lightLDR === 'on' && devices.lightLDR !== 'auto' ? 'font-semibold text-primary' : 'text-muted-foreground'
                  )}>
                    ON
                  </span>
                  <Switch
                    id="ldr-on-off-switch"
                    checked={devices.lightLDR === 'on'}
                    onCheckedChange={handleLDRSwitchChange}
                    disabled={isUpdatingLightLDR || devices.lightLDR === 'auto'}
                    aria-label="Toggle LDR Smart Light On or Off"
                  />
                  <span className={cn(
                    "text-sm select-none", 
                    devices.lightLDR === 'off' && devices.lightLDR !== 'auto' ? 'font-semibold text-primary' : 'text-muted-foreground'
                  )}>
                    OFF
                  </span>
                </div>
                <Button
                  variant={devices.lightLDR === 'auto' ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLDRAutoToggle}
                  disabled={isUpdatingLightLDR}
                  className="w-full"
                >
                  {isUpdatingLightLDR && <LoadingSpinner size={16} className="mr-1" />}
                  {devices.lightLDR === 'auto' ? 'Auto Mode Active' : 'Enable Auto Mode'}
                </Button>
                 <Link href="/devices">
                   <Button variant="link" size="sm" className="text-xs px-0 w-full justify-center">Advanced Settings</Button>
                 </Link>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70">
              <AnimatedLightControl
                lightId="light2"
                displayName="Bedroom Light"
                IconComponent={BedDouble}
              />
              <CardFooter className="justify-center pb-3 pt-0">
                 <Link href="/devices">
                   <Button variant="link" size="sm" className="text-xs px-0">Advanced Settings</Button>
                 </Link>
              </CardFooter>
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

