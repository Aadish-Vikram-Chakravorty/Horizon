'use client';
import { useSensorData } from '@/contexts/SensorContext';

export default function Dashboard() {
  const { sensorData, loading } = useSensorData();

  if (loading) return <div>Loading..</div>;
  if (!sensorData) return <div>No data available</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
      
      {/* Critical Alerts */}
      <div className="mb-6 p-4 bg-red-50 rounded-lg">
        <h2 className="font-semibold text-red-800">Important Alerts</h2>
        {sensorData.SensorData.waterShortage && (
          <p className="mt-2">⚠️ Water shortage detected!</p>
        )}
        {sensorData.SensorData.moisturePercent === 0 && (
          <p className="mt-2">⚠️ Critical soil moisture (0%) - Water immediately!</p>
        )}
      </div>

      {/* Sensor Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p>Temperature</p>
          <p className="text-2xl">{sensorData.SensorData.temperature}°C</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p>Humidity</p>
          <p className="text-2xl">{sensorData.SensorData.humidity}%</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p>Water Level</p>
          <p className="text-2xl">{sensorData.SensorData.waterPercent}%</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p>Soil Moisture</p>
          <p className="text-2xl">{sensorData.SensorData.moisturePercent}%</p>
        </div>
      </div>

      {/* Device Status */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Device Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>Water Pump: {sensorData.controls.water_pump ? 'ON' : 'OFF'}</p>
            <p>Light: {sensorData.controls.light ? 'ON' : 'OFF'}</p>
          </div>
          <div>
            <p>Fan: {sensorData.controls.fan ? 'ON' : 'OFF'}</p>
            <p>Flame: {sensorData.SensorData.flameDetected ? 'DETECTED' : 'SAFE'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}