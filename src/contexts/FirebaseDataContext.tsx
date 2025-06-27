"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

interface SensorData {
  brightness: number;  // 0-255 from Firebase
  waterLevel: number;  // 0-100+ from Firebase
  // Add other sensor fields as needed
}

type FirebaseContextType = {
  sensorData: SensorData;
  appData: any; // Consider using a proper type instead of 'any'
  loading: boolean;
  errors: string[];
  updateLightStatus: (status: boolean) => void;
  // Add any future context values here
};

export const FirebaseDataContext = createContext<FirebaseContextType | undefined>(undefined);

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
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      setSensorData({
        brightness: data?.brightness || 0,
        waterLevel: data?.waterLevel || 0,
      });
    });

    return () => unsubscribe();
  }, []);

  // Placeholder state and function for missing context values
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const updateLightStatus = (status: boolean) => {
    // Implement the logic to update light status in Firebase here
    // Example: set(ref(database, "lightStatus"), status);
  };

  return (
    <FirebaseDataContext.Provider
      value={{
        sensorData,
        appData,
        loading,
        errors,
        updateLightStatus,
      }}
    >
      {children}
    </FirebaseDataContext.Provider>
  );
}

// Custom hook to consume the context
export function useFirebaseData() {
  const context = useContext(FirebaseDataContext);
  if (context === undefined) {
    throw new Error('useFirebaseData must be used within a FirebaseDataContextProvider');
  }
  return context;
}