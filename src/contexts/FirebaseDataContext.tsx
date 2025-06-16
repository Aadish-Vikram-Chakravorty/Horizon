
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set, DatabaseReference } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { AppData, DeviceControls, LightStatus, HistoricalSensorData } from '@/types';

interface FirebaseContextType {
  appData: AppData | null;
  historicalData: HistoricalSensorData | null;
  loading: boolean;
  error: Error | null;
  updateLightStatus: (lightId: keyof DeviceControls, status: LightStatus) => Promise<void>;
  updateLDRIntensity: (intensity: number) => Promise<void>;
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
    light2: "off", // Added third light
    ldrIntensity: 50, // Default LDR intensity
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
            devices: {
              ...initialAppData.devices, // Start with defaults for all device properties
              ...(prevData?.devices),    // Spread previous device states
              ...(data.devices),         // Spread fetched device states (overwrites previous for fetched keys)
            }
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
      }
    );
    
    return () => {
      unsubscribeCurrentReadings();
      unsubscribeHistoricalData();
    };
  }, []);

  const updateLightStatus = async (lightId: keyof DeviceControls, status: LightStatus) => {
    try {
      // Ensure we are not trying to set ldrIntensity via this function
      if (lightId === 'ldrIntensity') return; 
      const lightRef: DatabaseReference = ref(database, `currentReadings/devices/${lightId}`);
      await set(lightRef, status);
    } catch (err) {
      console.error("Firebase write error (light status):", err);
      setError(err as Error); 
      throw err;
    }
  };

  const updateLDRIntensity = async (intensity: number) => {
    try {
      const intensityRef: DatabaseReference = ref(database, `currentReadings/devices/ldrIntensity`);
      await set(intensityRef, intensity);
    } catch (err) {
      console.error("Firebase write error (LDR intensity):", err);
      setError(err as Error);
      throw err;
    }
  };

  return (
    <FirebaseContext.Provider value={{ appData, historicalData, loading, error, updateLightStatus, updateLDRIntensity }}>
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
