
"use client";

import React, { useState, useEffect, type FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Thermometer, Droplets, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface WeatherWidgetProps {
  temperature: number;
  humidity: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const WeatherWidget: FC<WeatherWidgetProps> = ({
  temperature,
  humidity,
}) => {
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  // Placeholder for weather icon and condition, as we are not fetching full weather data
  const weatherCondition = "Weather"; // Generic placeholder
  const weatherIconSrc = "https://placehold.co/48x48.png"; 
  const weatherIconAlt = "Weather icon";

  useEffect(() => {
    const fetchLocationName = async (coords: Coordinates) => {
      // In a real app, you would use a reverse geocoding API here.
      // For this prototype, we'll simulate it or use a placeholder.
      // Example: OpenCage, Google Geocoding API, etc.
      // const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${coords.latitude}+${coords.longitude}&key=YOUR_API_KEY`);
      // const data = await response.json();
      // if (data.results && data.results.length > 0) {
      //   setLocationName(data.results[0].formatted);
      // } else {
      //   setLocationName("Unknown location");
      // }
      setLocationName(`Lat: ${coords.latitude.toFixed(2)}, Lon: ${coords.longitude.toFixed(2)}`); // Using coordinates for now
      setIsLoadingLocation(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchLocationName({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Location access denied.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setLocationError("Location request timed out.");
              break;
            default:
              setLocationError("An unknown error occurred.");
              break;
          }
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }
  }, []);

  return (
    <Card className="bg-gradient-to-br from-sky-400 to-blue-500 dark:from-sky-700 dark:to-blue-800 shadow-xl w-full max-w-xs rounded-xl overflow-hidden">
      <CardContent className="p-5 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Current Weather</h3>
            {isLoadingLocation && (
              <div className="flex items-center text-sm opacity-80 mt-1">
                <Loader2 size={14} className="mr-1 animate-spin" />
                <span>Fetching location...</span>
              </div>
            )}
            {locationName && !isLoadingLocation && (
              <div className="flex items-center text-sm opacity-90 mt-1">
                <MapPin size={14} className="mr-1" />
                <span>{locationName}</span>
              </div>
            )}
            {locationError && !isLoadingLocation && (
              <div className="flex items-center text-xs text-yellow-300 mt-1 bg-black/20 p-1 rounded">
                <AlertTriangle size={14} className="mr-1" />
                <span>{locationError}</span>
              </div>
            )}
          </div>
           <Image 
              src={weatherIconSrc} 
              alt={weatherIconAlt} 
              width={48}
              height={48} 
              className="rounded-md opacity-90" 
              data-ai-hint="weather cloud sun" 
            />
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1 opacity-80">
              <Thermometer size={18} className="mr-1.5" />
              <span className="text-xs">Temperature</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(temperature)}°C</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
             <div className="flex items-center justify-center mb-1 opacity-80">
              <Droplets size={18} className="mr-1.5" />
              <span className="text-xs">Humidity</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(humidity)}%</p>
          </div>
        </div>
         <p className="text-xs text-center mt-4 opacity-70">
            Weather condition is a placeholder.
          </p>
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;
