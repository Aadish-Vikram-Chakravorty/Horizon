
export interface SensorReadings {
  ldrBrightness: number; // e.g., 0-1023 or lux value
  humidity: number; // 0-100 %
  temperature: number; // Celsius
  waterLevel: number; // 0-100 %
  soilMoisture: number; // 0-100 % (higher is wetter, e.g. <10% is dry alert)
  flameDetected: boolean;
  waterShortage: boolean;
}

export type LightStatus = "on" | "off" | "auto";

export interface DeviceControls {
  light1: LightStatus;
  lightLDR: LightStatus;
  light2: LightStatus; 
  ldrIntensity?: number; 
}

export interface AppData {
  sensors: SensorReadings;
  devices: DeviceControls;
}

export interface HistoricalDataPoint {
  timestamp: number;
  value: number | boolean;
}

export interface HistoricalSensorData {
  [sensorKey: string]: HistoricalDataPoint[];
}

export interface AlertContent {
  id: string;
  type: 'soilMoisture' | 'flame' | 'waterShortage';
  title: string;
  message: string;
  timestamp: number;
  severity: "critical" | "warning" | "info";
  sensorValue?: number | boolean;
}
