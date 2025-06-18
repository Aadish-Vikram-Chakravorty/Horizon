'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function SensorPage() {
  const [sensorData, setSensorData] = useState<any>(null);

  useEffect(() => {
    // Directly reference the root path or specific nodes
    const dataRef = ref(database, '/');
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      setSensorData(snapshot.val());
    });

    return () => unsubscribe();
  }, []);

  if (!sensorData) return <div className="p-4">Loading sensor data...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Smart Home Dashboard</h1>
      
      {/* Sensor Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Temperature</h3>
          <p className="text-3xl">{sensorData.SensorData.temperature}°C</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Humidity</h3>
          <p className="text-3xl">{sensorData.SensorData.humidity}%</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Water Level</h3>
          <p className="text-3xl">{sensorData.SensorData.waterPercent}%</p>
          {sensorData.SensorData.waterShortage && (
            <p className="text-red-500 text-sm">Low water!</p>
          )}
        </div>
      </div>

      {/* Device Controls Status */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold mb-2">Device Status</h2>
        <div className="flex gap-4">
          <div>
            <p>Water Pump: {sensorData.controls.water_pump ? 'ON' : 'OFF'}</p>
            <p>Light: {sensorData.controls.light ? 'ON' : 'OFF'}</p>
            <p>Fan: {sensorData.controls.fan ? 'ON' : 'OFF'}</p>
          </div>
          <div>
            <p>Flame Detected: {sensorData.SensorData.flameDetected ? 'YES' : 'NO'}</p>
            <p>Pump State: {sensorData.SensorData.pumpState}</p>
          </div>
        </div>
      </div>
    </div>
  );
}