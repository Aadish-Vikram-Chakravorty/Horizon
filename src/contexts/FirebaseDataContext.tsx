"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set, DatabaseReference } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { AppData, SensorReadings, DeviceControls, LightStatus, HistoricalSensorData } from '@/types';

interface FirebaseContextType {
  appData: AppData | null;
  historicalData: HistoricalSensorData | null;
  loading: boolean;
  error: Error | null;
  updateLightStatus: (lightId: keyof DeviceControls, status: LightStatus) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const initialAppData: AppData = {
  sensors: {
    ldrBrightness: 0,
    humidity: 0,
    temperature: 0,
    waterLevel: 0,
    soilMoisture: 0,
    flameDetected: false,
    waterShortage: false,
  },
  devices: {
    light1: "off",
    lightLDR: "off",
  },
};

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [appData, setAppData] = useState<AppData | null>(initialAppData);
  const [historicalData, setHistoricalData] = useState<HistoricalSensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const currentReadingsRef = ref(database, 'currentReadings');
    const historicalDataRef = ref(database, 'historicalData');

    const unsubscribeCurrentReadings = onValue(
      currentReadingsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setAppData(prevData => ({
            sensors: data.sensors || prevData?.sensors || initialAppData.sensors,
            devices: data.devices || prevData?.devices || initialAppData.devices,
          }));
        } else {
           setAppData(initialAppData); // Set to initial if no data
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firebase read error (currentReadings):", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    const unsubscribeHistoricalData = onValue(
      historicalDataRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setHistoricalData(data);
        }
      },
      (err) => {
        console.error("Firebase read error (historicalData):", err);
        // Not critical if historical data fails for basic ops
      }
    );
    
    return () => {
      unsubscribeCurrentReadings();
      unsubscribeHistoricalData();
    };
  }, []);

  const updateLightStatus = async (lightId: keyof DeviceControls, status: LightStatus) => {
    try {
      const lightRef: DatabaseReference = ref(database, `currentReadings/devices/${lightId}`);
      await set(lightRef, status);
    } catch (err) {
      console.error("Firebase write error:", err);
      setError(err as Error); // Or use toast to show error
      throw err; // Re-throw for component handling
    }
  };

  return (
    <FirebaseContext.Provider value={{ appData, historicalData, loading, error, updateLightStatus }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebaseData = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseData must be used within a FirebaseProvider');
  }
  return context;
};
