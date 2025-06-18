'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const SensorContext = createContext<any>(null);

export function SensorProvider({ children }: { children: React.ReactNode }) {
  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://YOUR_PROJECT_ID.firebaseio.com/.json');
        const data = await res.json();
        setSensorData(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SensorContext.Provider value={{ sensorData, loading }}>
      {children}
    </SensorContext.Provider>
  );
}

export const useSensorData = () => useContext(SensorContext);