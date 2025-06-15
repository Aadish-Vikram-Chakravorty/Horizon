"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Thermometer, Droplets, Wind, ShieldAlert, AlertTriangle, Activity, CheckCircle2, XCircle, Bot } from 'lucide-react';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { AlertContent, PredictedIssue, SensorReadings } from '@/types';
import { generateAlertSummary } from '@/ai/flows/generate-alert-summary';
import { predictPotentialIssues } from '@/ai/flows/predict-potential-issues';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      return value > 500 ? 'Bright 💡' : 'Dim 💡'; // Assuming 0-1023 range
    case 'flameDetected':
      return value ? 'Detected 🔥' : 'Safe ✅';
    case 'waterShortage':
      return value ? 'Shortage 🚱' : 'Available ✅';
    default:
      return '';
  }
};


export default function HomePage() {
  const { appData, historicalData, loading, error } = useFirebaseData();
  const [alerts, setAlerts] = useState<AlertContent[]>([]);
  const [predictions, setPredictions] = useState<PredictedIssue[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => {
    if (appData?.sensors && !isAiProcessing) {
      const processAlerts = async () => {
        setIsAiProcessing(true);
        const newAlerts: AlertContent[] = [];
        const currentSensors = appData.sensors;

        // Soil Moisture Alert
        if (currentSensors.soilMoisture < 10) {
          try {
            const summary = await generateAlertSummary({
              sensorType: 'Soil Moisture',
              sensorValue: currentSensors.soilMoisture,
              threshold: 10,
              historicalData: JSON.stringify(historicalData?.soilMoisture || []),
            });
            newAlerts.push({
              id: 'soilMoistureLow',
              type: 'soilMoisture',
              title: 'Low Soil Moisture!',
              message: summary.summary,
              timestamp: Date.now(),
              severity: 'warning',
              sensorValue: currentSensors.soilMoisture,
            });
          } catch (e) {
            console.error("Error generating soil moisture alert summary:", e);
            newAlerts.push({
              id: 'soilMoistureLow_fallback', type: 'soilMoisture', title: 'Low Soil Moisture!', 
              message: `Soil moisture is critically low (${currentSensors.soilMoisture}%). Water your plants.`,
              timestamp: Date.now(), severity: 'warning', sensorValue: currentSensors.soilMoisture
            });
          }
        }

        // Flame Detection Alert
        if (currentSensors.flameDetected) {
           try {
            const summary = await generateAlertSummary({
              sensorType: 'Flame Sensor',
              sensorValue: 1, // 1 for true
              threshold: 0, // 0 for false
              historicalData: JSON.stringify(historicalData?.flameDetected || []), // Assuming you might log this
            });
            newAlerts.push({
              id: 'flameDetected', type: 'flame', title: 'Flame Detected!',
              message: summary.summary, timestamp: Date.now(), severity: 'critical', sensorValue: true
            });
          } catch (e) {
             console.error("Error generating flame alert summary:", e);
             newAlerts.push({
              id: 'flameDetected_fallback', type: 'flame', title: 'Flame Detected!',
              message: 'A flame has been detected! Take immediate action.',
              timestamp: Date.now(), severity: 'critical', sensorValue: true
            });
          }
        }
        
        // Water Shortage Alert
        if (currentSensors.waterShortage) {
          try {
            const summary = await generateAlertSummary({
              sensorType: 'Water Supply',
              sensorValue: 1, // 1 for true (shortage)
              threshold: 0, // 0 for false (no shortage)
              historicalData: "No specific historical data format for boolean water shortage.",
            });
             newAlerts.push({
              id: 'waterShortage', type: 'waterShortage', title: 'Water Shortage!',
              message: summary.summary, timestamp: Date.now(), severity: 'critical', sensorValue: true
            });
          } catch (e) {
            console.error("Error generating water shortage alert summary:", e);
            newAlerts.push({
              id: 'waterShortage_fallback', type: 'waterShortage', title: 'Water Shortage!',
              message: 'Water supply is critically low. Check your main water source.',
              timestamp: Date.now(), severity: 'critical', sensorValue: true
            });
          }
        }
        setAlerts(newAlerts);

        // Potential Issue Prediction (Example: Soil Moisture Trend)
        if (historicalData?.soilMoisture && historicalData.soilMoisture.length > 2) {
          try {
            const prediction = await predictPotentialIssues({
              historicalSensorData: JSON.stringify(historicalData.soilMoisture),
              sensorType: 'Soil Moisture',
            });
            if (prediction.predictedIssue && prediction.confidenceLevel > 0.5) { // Only show reasonably confident predictions
              setPredictions([prediction]);
            }
          } catch (e) {
            console.error("Error predicting potential issues:", e);
          }
        }
        setIsAiProcessing(false);
      };
      processAlerts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appData, historicalData]); // Removed isAiProcessing from deps to avoid loop

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
            <AlertTriangle /> Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load dashboard data. Please check your connection or try again later.</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  const sensors = appData?.sensors;
  const devices = appData?.devices;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <motion.div initial="hidden" animate="visible" variants={cardVariants}>
        <h1 className="text-3xl font-bold font-headline text-primary mb-6">Dashboard</h1>
      
        {/* Alerts Section */}
        {(alerts.length > 0 || predictions.length > 0) && (
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-destructive">
              <ShieldAlert /> Important Alerts & Predictions
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alerts.map(alert => (
                <Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-destructive' : 'border-yellow-500'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {alert.severity === 'critical' ? <AlertTriangle className="text-destructive"/> : <Activity className="text-yellow-500"/>}
                      {alert.title}
                    </CardTitle>
                    <CardDescription>{new Date(alert.timestamp).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{alert.message}</p>
                    {alert.sensorValue !== undefined && <p className="text-sm mt-1">Value: {String(alert.sensorValue)}</p>}
                  </CardContent>
                </Card>
              ))}
              {predictions.map((pred, idx) => (
                 <Card key={`pred-${idx}`} className="border-l-4 border-accent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-accent-foreground">
                      <Bot /> AI Prediction
                    </CardTitle>
                     <CardDescription>Confidence: {(pred.confidenceLevel * 100).toFixed(0)}%</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{pred.predictedIssue}</p>
                    <p className="text-sm text-muted-foreground mt-1">Suggestion: {pred.suggestedAction}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
             {isAiProcessing && <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><LoadingSpinner size={16}/> Processing AI insights...</div>}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className={devices.light1 !== "off" ? "text-yellow-400" : ""} /> Living Room Light
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl">Status: <span className="font-semibold capitalize">{devices.light1}</span></p>
                <Progress value={devices.light1 === "on" ? 100 : devices.light1 === "auto" ? 50 : 0} className="mt-2 h-2" />
                <Link href="/devices" passHref>
                  <Button variant="outline" size="sm" className="mt-4">Manage</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className={devices.lightLDR !== "off" ? "text-yellow-400" : ""} /> LDR Light
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl">Status: <span className="font-semibold capitalize">{devices.lightLDR}</span></p>
                 <Progress value={devices.lightLDR === "on" ? 100 : devices.lightLDR === "auto" ? 50 : 0} className="mt-2 h-2" />
                <Link href="/devices" passHref>
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
