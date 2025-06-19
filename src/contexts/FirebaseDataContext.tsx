'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set, DatabaseReference } from 'firebase/database';
import { database } from '@/lib/firebase'; 
import type { AppData, DeviceControls, LightStatus, HistoricalSensorData, SensorReadings } from '@/types';

interface FirebaseContextType {
  appData: AppData | null;
  historicalData: HistoricalSensorData | null;
  loading: boolean;
  error: Error | null;
  updateLightStatus: (lightId: keyof DeviceControls, status: LightStatus) => Promise<void>;
  updateLDRIntensity: (intensity: number) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalSensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const sensorsRef = ref(database, 'SensorData'); // Changed path
    const devicesRef = ref(database, 'controls');   // Changed path
    const historicalRef = ref(database, 'historicalData');

    const unsubscribeSensors = onValue(sensorsRef, 
      (snapshot) => {
        setAppData(prev => prev ? {
          ...prev,
          sensors: snapshot.val()
        } : {
          sensors: snapshot.val(),
          devices: {} as DeviceControls
        });
      },
      (err) => {
        console.error("Sensors read error:", err);
        setError(err);
      }
    );

    const unsubscribeDevices = onValue(devicesRef,
      (snapshot) => {
        setAppData(prev => ({
          ...prev || { sensors: {} as SensorReadings }, // Handle first load with empty sensor readings
          devices: snapshot.val()
        }));
        setLoading(false);
      },
      (err) => {
        console.error("Devices read error:", err);
        setError(err);
        setLoading(false);
      }
    );

    const unsubscribeHistorical = onValue(historicalRef,
      (snapshot) => setHistoricalData(snapshot.val())
    );

    return () => {
      unsubscribeSensors();
      unsubscribeDevices();
      unsubscribeHistorical();
    };
  }, []);

  const updateLightStatus = async (lightId: keyof DeviceControls, status: LightStatus) => {
    try {
      const lightRef = ref(database, `controls/${lightId}`);
      await set(lightRef, status);
    } catch (err) {
      console.error("Update failed:", err);
      setError(err as Error);
      throw err;
    }
  };

  const updateLDRIntensity = async (intensity: number) => {
    try {
      const intensityRef = ref(database, `controls/ldrIntensity`);
      await set(intensityRef, intensity);
    } catch (err) {
      console.error("Intensity update failed:", err);
      setError(err as Error);
      throw err;
    }
  };

  return (
    <FirebaseContext.Provider value={{ 
      appData, 
      historicalData, 
      loading, 
      error, 
      updateLightStatus, 
      updateLDRIntensity 
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebaseData = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('Missing FirebaseProvider');
  return context;
};
