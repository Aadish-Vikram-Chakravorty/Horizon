"use client";
import { Card } from "@/components/ui/card";
import { useContext } from "react";
import { FirebaseDataContext } from "@/contexts/FirebaseDataContext";
import { Alert } from "@/components/ui/alert";
export default function Dashboard() {
  const { sensorData } = useContext(FirebaseDataContext);

  // Normalize brightness (0-255 → 0-100%)
  const brightnessPercent = Math.min(100, Math.round((sensorData.brightness / 255) * 100));

  // Handle water level alerts
  const waterPercent = Math.min(100, sensorData.waterLevel);
  const isWaterShortage = waterPercent <= 20;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Brightness Card */}
      <Card>
        <h3 className="text-lg font-semibold">Brightness</h3>
        <div className="mt-2">
          <div className="h-4 w-full bg-gray-200 rounded-full">
            <div
              className="h-4 bg-yellow-400 rounded-full"
              style={{ width: `${brightnessPercent}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm">{brightnessPercent}%</p>
        </div>
      </Card>

      {/* Water Level Card */}
      <Card>
        <h3 className="text-lg font-semibold">Water Level</h3>
        <div className="mt-2">
          <div className="h-4 w-full bg-gray-200 rounded-full">
            <div
              className={`h-4 rounded-full ${waterPercent <= 20 ? "bg-red-500" : "bg-blue-500"}`}
              style={{ width: `${waterPercent}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm">{waterPercent}%</p>
          {isWaterShortage && (
            <Alert variant="destructive" className="mt-2">
              Water Shortage Alert!
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}