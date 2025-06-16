
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import type { FC } from 'react';

interface WeatherWidgetProps {
  temperature: number;
  humidity: number;
  // Placeholder data, to be replaced by API data ideally
  weatherCondition?: string;
  location?: string;
  sensibleTempOffset?: number; 
  windForceDisplayValue?: string; // e.g., "3"
  pressureDisplayValue?: string; // e.g., "1009hPa"
  weatherIconSrc?: string; 
  weatherIconAlt?: string;
}

const WeatherWidget: FC<WeatherWidgetProps> = ({
  temperature,
  humidity,
  weatherCondition = "Cloudy",
  location = "Rajshahi, Bangladesh", // Placeholder from OCR
  sensibleTempOffset = 3, // To match 31° sensible from 28° main in OCR
  windForceDisplayValue = "3",    // Placeholder from OCR
  pressureDisplayValue = "1009hPa", // Placeholder from OCR
  weatherIconSrc = "https://placehold.co/56x56.png", 
  weatherIconAlt = "Weather condition icon"
}) => {
  const sensibleTemp = temperature + sensibleTempOffset;

  return (
    <Card className="bg-sky-100 dark:bg-sky-800/60 border-sky-200 dark:border-sky-700 shadow-lg w-full max-w-md rounded-xl overflow-hidden">
      <CardContent className="p-6 text-slate-800 dark:text-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <Image 
              src={weatherIconSrc} 
              alt={weatherIconAlt} 
              width={56}
              height={56} 
              className="rounded-md" 
              data-ai-hint="weather sun cloud" // Hint for image replacement
            />
            <div>
              <p className="text-2xl font-bold">{weatherCondition}</p>
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                <MapPin size={12} className="mr-1" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          <p className="text-5xl font-bold">{Math.round(temperature)}°</p>
        </div>

        <div className="grid grid-cols-4 gap-x-2 text-center">
          <div className="py-1">
            <p className="text-xl font-semibold">{Math.round(sensibleTemp)}°</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sensible</p>
          </div>
          <div className="py-1">
            <p className="text-xl font-semibold">{Math.round(humidity)}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Humidity</p>
          </div>
          <div className="py-1">
            <p className="text-xl font-semibold">{windForceDisplayValue}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">W. force</p>
          </div>
          <div className="py-1">
            <p className="text-xl font-semibold">{pressureDisplayValue}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pressure</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;
