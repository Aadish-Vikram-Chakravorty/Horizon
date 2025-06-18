'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function SensorPage() {
  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const dataRef = ref(database, '/');

    const unsubscribe = onValue(dataRef,
      (snapshot) => {
        const data = snapshot.val();
        setSensorData(data);
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Firebase read error:', error);
        setError('Failed to load sensor data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        {error} - Please check console for details
      </div>
    );
  }

  if (!sensorData) {
    return <div className="p-4">No sensor data available</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Smart Home Dashboard</h1>
        <span className="text-sm text-gray-500">
          Last updated: {lastUpdated}
        </span>
      </div>

      {/* Sensor Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow transition-all hover:shadow-md">
          <h3 className="font-semibold">Temperature</h3>
          <p className="text-3xl font-mono">
            {sensorData.SensorData.temperature}°C
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow transition-all hover:shadow-md">
          <h3 className="font-semibold">Humidity</h3>
          <p className="text-3xl font-mono">
            {sensorData.SensorData.humidity}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow transition-all hover:shadow-md">
          <h3 className="font-semibold">Water Level</h3>
          <p className="text-3xl font-mono">
            {sensorData.SensorData.waterPercent}%
          </p>
          {sensorData.SensorData.waterShortage && (
            <p className="text-red-500 text-sm mt-1">⚠️ Low water warning!</p>
          )}
        </div>
      </div>

      {/* Device Controls Status */}
      <div className="bg-white p-4 rounded-lg shadow transition-all hover:shadow-md">
        <h2 className="font-bold mb-3">Device Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p>
              Water Pump:
              <span className={`ml-2 font-mono ${sensorData.controls.water_pump ? 'text-green-600' : 'text-gray-600'}`}>
                {sensorData.controls.water_pump ? 'ON' : 'OFF'}
              </span>
            </p>
            <p>
              Light:
              <span className={`ml-2 font-mono ${sensorData.controls.light ? 'text-green-600' : 'text-gray-600'}`}>
                {sensorData.controls.light ? 'ON' : 'OFF'}
              </span>
            </p>
            <p>
              Fan:
              <span className={`ml-2 font-mono ${sensorData.controls.fan ? 'text-green-600' : 'text-gray-600'}`}>
                {sensorData.controls.fan ? 'ON' : 'OFF'}
              </span>
            </p>
          </div>
          <div className="space-y-2">
            <p>
              Flame Detected:
              <span className={`ml-2 font-mono ${sensorData.SensorData.flameDetected ? 'text-red-600' : 'text-green-600'}`}>
                {sensorData.SensorData.flameDetected ? 'YES' : 'NO'}
              </span>
            </p>
            <p>
              Pump State:
              <span className="ml-2 font-mono">
                {sensorData.SensorData.pumpState}
              </span>
            </p>
            <p>
              Soil Moisture:
              <span className="ml-2 font-mono">
                {sensorData.SensorData.moisturePercent}%
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}