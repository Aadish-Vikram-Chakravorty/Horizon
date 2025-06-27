"use client";
import { createContext, useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

interface SensorData {
  brightness: number;  // Expects 0-255 from Firebase
  waterLevel: number;  // Expects 0-100+ from Firebase
}

export const FirebaseDataContext = createContext<{
  sensorData: SensorData;
}>({
  sensorData: {
    brightness: 0,
    waterLevel: 0,
  },
});

interface FirebaseDataContextProviderProps {
  children: React.ReactNode;
}

export function FirebaseDataContextProvider({ children }: FirebaseDataContextProviderProps) {
  const [sensorData, setSensorData] = useState<SensorData>({
    brightness: 0,
    waterLevel: 0,
  });

  useEffect(() => {
    const sensorRef = ref(database, "sensors");
    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      setSensorData({
        brightness: data.brightness || 0,
        waterLevel: data.waterLevel || 0,
      });
    });
  }, []);

  return (
    <FirebaseDataContext.Provider value={{ sensorData }}>
      {children}
    </FirebaseDataContext.Provider>
  );
}