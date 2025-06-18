
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { AlertContent } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Bell, Flame, Leaf, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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

const getAlertIcon = (alertType: AlertContent['type'], severity: AlertContent['severity']): React.ElementType => {
  switch (alertType) {
    case 'flame': return Flame;
    case 'soilMoisture': return Leaf;
    case 'waterShortage': return AlertTriangle;
    default: return Bell; // Default icon for unknown types
  }
};

export default function AlertsPage() {
  const { appData, loading, error } = useFirebaseData();
  const [currentAlerts, setCurrentAlerts] = useState<AlertContent[]>([]);

  useEffect(() => {
    if (appData?.sensors) {
      const processAlerts = () => {
        const newAlerts: AlertContent[] = [];
        const sensors = appData.sensors;

        // For the "Alerts" page, we simulate a history by re-evaluating current sensor data.
        // A true persistent history would require storing each alert event.
        if (sensors.soilMoisture < 10) {
          newAlerts.push({
            id: 'soilMoistureLow_hist', type: 'soilMoisture', title: 'Low Soil Moisture!',
            message: `Soil moisture is critically low (${sensors.soilMoisture}%). Immediate watering needed.`,
            timestamp: Date.now() - Math.random() * 1000 * 60 * 5, // Simulate slightly older alerts
            severity: 'critical', sensorValue: sensors.soilMoisture,
          });
        } else if (sensors.soilMoisture < 20) {
          newAlerts.push({
            id: 'soilMoistureWarning_hist', type: 'soilMoisture', title: 'Low Soil Moisture Warning',
            message: `Soil moisture is low (${sensors.soilMoisture}%). Consider watering soon.`,
            timestamp: Date.now() - Math.random() * 1000 * 60 * 3,
            severity: 'warning', sensorValue: sensors.soilMoisture,
          });
        }

        if (sensors.flameDetected) {
          newAlerts.push({
            id: 'flameDetected_hist', type: 'flame', title: 'Flame Detected!',
            message: 'A flame has been detected! Take immediate action.',
            timestamp: Date.now() - Math.random() * 1000 * 60 * 10,
            severity: 'critical', sensorValue: sensors.flameDetected,
          });
        }
        
        if (sensors.waterShortage) {
          newAlerts.push({
            id: 'waterShortage_hist', type: 'waterShortage', title: 'Water Shortage!',
            message: 'Water supply is critically low. Check your main water source.',
            timestamp: Date.now() - Math.random() * 1000 * 60 * 2,
            severity: 'critical', sensorValue: sensors.waterShortage,
          });
        }
        // Example of an older, informational alert if conditions were previously fine
        if (newAlerts.length === 0 && Math.random() > 0.7) {
             newAlerts.push({
                id: 'systemOk_prev_hist', type: 'soilMoisture', title: 'System Check Normal',
                message: 'All sensor readings were nominal an hour ago.',
                timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
                severity: 'info',
             });
        }

        setCurrentAlerts(newAlerts.sort((a, b) => b.timestamp - a.timestamp));
      };
      processAlerts();
      
      // Simulate new alerts occasionally for demonstration if Firebase doesn't update frequently
      const intervalId = setInterval(processAlerts, 300000); // Refresh alerts every 5 mins
      return () => clearInterval(intervalId);

    }
  }, [appData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-auto mt-10 max-w-md border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle /> Error Loading Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load alert data. Please check your connection or try again later.</p>
          {error && <p className="text-sm text-muted-foreground mt-2">{error.message}</p>}
        </CardContent>
      </Card>
    );
  }
  
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto p-4">
      <motion.div initial="hidden" animate="visible" variants={pageVariants}>
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold font-headline text-primary flex items-center gap-2">
              <Bell /> Alerts Log
            </h1>
            <p className="text-muted-foreground mt-1">
              History of system alerts and notifications.
            </p>
          </div>
        </motion.div>

        {currentAlerts.length > 0 ? (
          <motion.div 
            className="space-y-4 max-w-2xl mx-auto" // Single column, max width for readability
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }} // Stagger children for alert list
          >
            {currentAlerts.map(alert => {
              const IconComponent = getAlertIcon(alert.type, alert.severity);
              const iconColorClass = alert.severity === 'critical' ? 'text-destructive' : 
                                     alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500';

              return (
                <motion.div key={alert.id} variants={itemVariants}>
                  <Card 
                    className={`border-l-4 ${
                      alert.severity === 'critical' 
                        ? 'border-destructive dark:border-red-500' 
                        : alert.severity === 'warning' 
                          ? 'border-yellow-500 dark:border-yellow-400'
                          : 'border-blue-500 dark:border-blue-400'
                    } shadow-lg hover:shadow-xl transition-shadow duration-300`}
                  >
                    <CardHeader className="py-3 px-5"> 
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-md">
                            <IconComponent className={`${iconColorClass} h-5 w-5`} />
                            {alert.title}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                          </CardDescription>
                        </div>
                        <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs px-2 py-0.5">
                          {getSeverityText(alert.severity)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3 px-5">
                      <p className="text-sm">{alert.message}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
             <Card className="border-l-4 border-green-500 dark:border-green-400 shadow-lg shadow-green-500/20 dark:shadow-green-400/20 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="py-3 px-5">
                  <CardTitle className="flex items-center gap-2 text-md text-green-700 dark:text-green-300">
                    <ShieldCheck className="h-5 w-5 text-green-500 dark:text-green-400" />
                    No Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3 px-5">
                  <p className="text-sm">Everything is fine, Your home is safe.</p>
                </CardContent>
              </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

    