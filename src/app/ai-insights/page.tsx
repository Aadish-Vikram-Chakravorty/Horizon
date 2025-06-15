"use client";

import React, { useEffect, useState } from 'react';
import { useFirebaseData } from '@/contexts/FirebaseDataContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';
import { generateAlertSummary } from '@/ai/flows/generate-alert-summary';
import { predictPotentialIssues } from '@/ai/flows/predict-potential-issues';
import type { AlertContent, PredictedIssue, SensorReadings } from '@/types';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AiInsightsPage() {
  const { appData, historicalData, loading, error: firebaseError } = useFirebaseData();
  const [generatedAlerts, setGeneratedAlerts] = useState<AlertContent[]>([]);
  const [predictions, setPredictions] = useState<PredictedIssue[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const processAiInsights = async () => {
    if (!appData?.sensors || !historicalData) {
      setProcessingError("Sensor data or historical data is not available for AI processing.");
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    const newAlerts: AlertContent[] = [];
    const newPredictions: PredictedIssue[] = [];
    const currentSensors = appData.sensors;

    // Example: Soil Moisture Alert Generation
    if (currentSensors.soilMoisture < 10) {
      try {
        const summary = await generateAlertSummary({
          sensorType: 'Soil Moisture',
          sensorValue: currentSensors.soilMoisture,
          threshold: 10,
          historicalData: JSON.stringify(historicalData.soilMoisture || []),
        });
        newAlerts.push({
          id: 'ai_soilMoistureLow', type: 'soilMoisture', title: 'AI: Low Soil Moisture',
          message: summary.summary, timestamp: Date.now(), severity: 'warning',
        });
      } catch (e) { console.error("AI Alert (Soil):", e); /* Add fallback or error display */ }
    }
    
    // Example: Flame Detection Alert
    if (currentSensors.flameDetected) {
       try {
        const summary = await generateAlertSummary({
          sensorType: 'Flame Sensor', sensorValue: 1, threshold: 0,
          historicalData: JSON.stringify(historicalData.flameDetected || []),
        });
        newAlerts.push({
          id: 'ai_flameDetected', type: 'flame', title: 'AI: Flame Alert!',
          message: summary.summary, timestamp: Date.now(), severity: 'critical',
        });
      } catch (e) { console.error("AI Alert (Flame):", e); }
    }

    // Example: Prediction based on Temperature
    if (historicalData.temperature && historicalData.temperature.length > 2) {
      try {
        const prediction = await predictPotentialIssues({
          historicalSensorData: JSON.stringify(historicalData.temperature),
          sensorType: 'Temperature',
        });
        if(prediction.predictedIssue) newPredictions.push(prediction);
      } catch (e) { console.error("AI Prediction (Temp):", e); }
    }
    
    // Example: Prediction based on Humidity
    if (historicalData.humidity && historicalData.humidity.length > 2) {
      try {
        const prediction = await predictPotentialIssues({
          historicalSensorData: JSON.stringify(historicalData.humidity),
          sensorType: 'Humidity',
        });
         if(prediction.predictedIssue) newPredictions.push(prediction);
      } catch (e) { console.error("AI Prediction (Humidity):", e); }
    }

    setGeneratedAlerts(newAlerts);
    setPredictions(newPredictions);
    setIsProcessing(false);
  };
  
  useEffect(() => {
    // Automatically process on load if data is available
    if (appData && historicalData && !isProcessing && generatedAlerts.length === 0 && predictions.length === 0) {
      processAiInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appData, historicalData]); // Deliberately not including isProcessing, generatedAlerts, predictions to avoid loops

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner size={48} /></div>;
  }

  if (firebaseError) {
    return (
      <Card className="m-auto mt-10 max-w-md border-destructive">
        <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Error Loading Data</CardTitle></CardHeader>
        <CardContent><p>Could not load data needed for AI insights. {firebaseError.message}</p></CardContent>
      </Card>
    );
  }
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold font-headline text-primary">AI Insights Center</h1>
        <Button onClick={processAiInsights} disabled={isProcessing}>
          {isProcessing ? <LoadingSpinner size={18} className="mr-2" /> : <Bot className="mr-2 h-4 w-4" />}
          {isProcessing ? 'Processing...' : 'Refresh AI Insights'}
        </Button>
      </div>

      {processingError && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle />Processing Error</CardTitle></CardHeader>
          <CardContent><p>{processingError}</p></CardContent>
        </Card>
      )}
      
      <motion.div initial="hidden" animate="visible" variants={cardVariants}>
        {/* Generated Alerts Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="text-green-500"/> AI Generated Summaries & Alerts</h2>
          {generatedAlerts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {generatedAlerts.map(alert => (
                <motion.div variants={itemVariants} key={alert.id}>
                  <Card className={`border-l-4 ${alert.severity === 'critical' ? 'border-destructive' : 'border-yellow-500'}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {alert.type === 'flame' && <Flame className="text-destructive"/>}
                        {alert.type === 'soilMoisture' && <Lightbulb className="text-yellow-500"/>}
                        {alert.title}
                      </CardTitle>
                      <CardDescription>{new Date(alert.timestamp).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent><p>{alert.message}</p></CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{isProcessing ? 'Analyzing data...' : 'No specific AI-generated alerts at this moment. System normal or click refresh.'}</p>
          )}
        </section>

        {/* Predictions Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Bot className="text-accent-foreground"/> Potential Issue Predictions</h2>
          {predictions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {predictions.map((pred, idx) => (
                <motion.div variants={itemVariants} key={`pred-${idx}`}>
                  <Card className="border-l-4 border-accent">
                    <CardHeader>
                      <CardTitle className="text-lg text-accent-foreground">{pred.predictedIssue}</CardTitle>
                      <CardDescription>Confidence: <span className="font-bold">{(pred.confidenceLevel * 100).toFixed(0)}%</span></CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">Suggested Action:</p>
                      <p className="text-sm">{pred.suggestedAction}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{isProcessing ? 'Forecasting potential issues...' : 'No specific predictions at this moment or confidence too low. System stable.'}</p>
          )}
        </section>
      </motion.div>
    </div>
  );
}
