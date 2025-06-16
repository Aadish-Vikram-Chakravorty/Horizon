
"use client";

import React, { useState, useEffect, type FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Thermometer, Droplets, AlertTriangle, Loader2, CloudSun } from 'lucide-react'; // Using CloudSun as a generic weather icon
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
  
  // Placeholder for weather condition and icon (dynamic data would require a weather API)
  const [weatherConditionText, setWeatherConditionText] = useState<string>("Weather Info");
  const [weatherIconUrl, setWeatherIconUrl] = useState<string>("https://placehold.co/48x48.png");
  const [weatherIconAlt, setWeatherIconAlt] = useState<string>("Generic weather icon");
  const [weatherDataAiHint, setWeatherDataAiHint] = useState<string>("weather generic");


  useEffect(() => {
    // Simulate fetching more detailed weather info including condition and icon based on temp/humidity
    // In a real app, this would likely be part of a broader weather API call
    if (temperature > 30 && humidity < 40) {
      setWeatherConditionText("Sunny");
      setWeatherIconUrl("https://placehold.co/48x48.png"); // Replace with actual sunny icon URL
      setWeatherIconAlt("Sunny weather icon");
      setWeatherDataAiHint("weather sun");
    } else if (humidity > 70) {
      setWeatherConditionText("Cloudy / Rain");
      setWeatherIconUrl("https://placehold.co/48x48.png"); // Replace with actual cloudy/rainy icon URL
      setWeatherIconAlt("Cloudy or rainy weather icon");
      setWeatherDataAiHint("weather cloud rain");
    } else {
      setWeatherConditionText("Mixed");
      setWeatherIconUrl("https://placehold.co/48x48.png"); // Replace with generic/mixed icon URL
      setWeatherIconAlt("Mixed weather icon");
      setWeatherDataAiHint("weather cloud sun");
    }
  }, [temperature, humidity]);

  useEffect(() => {
    const fetchLocationName = async (coords: Coordinates) => {
      // To get City and Country from coordinates, a reverse geocoding API is needed.
      // Example:
      // try {
      //   const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${coords.latitude}+${coords.longitude}&key=YOUR_API_KEY`);
      //   const data = await response.json();
      //   if (data.results && data.results.length > 0) {
      //     const components = data.results[0].components;
      //     const city = components.city || components.town || components.village || "Unknown City";
      //     const country = components.country || "Unknown Country";
      //     setLocationName(`${city}, ${country} (Lat: ${coords.latitude.toFixed(2)}, Lon: ${coords.longitude.toFixed(2)})`);
      //   } else {
      //     setLocationName(`Lat: ${coords.latitude.toFixed(2)}, Lon: ${coords.longitude.toFixed(2)} (Could not determine city/country)`);
      //   }
      // } catch (error) {
      //   console.error("Reverse geocoding error:", error);
      //   setLocationName(`Lat: ${coords.latitude.toFixed(2)}, Lon: ${coords.longitude.toFixed(2)} (API error)`);
      // }
      // For now, we'll just display coordinates.
      setLocationName(`Lat: ${coords.latitude.toFixed(2)}, Lon: ${coords.longitude.toFixed(2)}`);
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
              setLocationError("Location access denied. Please enable it in your browser settings.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setLocationError("Location request timed out.");
              break;
            default:
              setLocationError("An unknown error occurred while fetching location.");
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
    <Card className="bg-gradient-to-br from-sky-400 to-blue-500 dark:from-sky-700 dark:to-blue-800 shadow-xl w-full max-w-sm rounded-xl overflow-hidden">
      <CardContent className="p-5 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{weatherConditionText}</h3>
            {isLoadingLocation && (
              <div className="flex items-center text-sm opacity-80 mt-1">
                <Loader2 size={14} className="mr-1 animate-spin" />
                <span>Fetching location...</span>
              </div>
            )}
            {locationName && !isLoadingLocation && (
              <div className="flex items-center text-sm opacity-90 mt-1">
                <MapPin size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate" title={locationName}>{locationName}</span>
              </div>
            )}
            {locationError && !isLoadingLocation && (
              <div className="flex items-center text-xs text-yellow-300 mt-1 bg-black/20 p-1 rounded">
                <AlertTriangle size={14} className="mr-1 flex-shrink-0" />
                <span>{locationError}</span>
              </div>
            )}
          </div>
           <Image 
              src={weatherIconUrl} 
              alt={weatherIconAlt}
              width={56} 
              height={56}
              className="rounded-md opacity-90 object-cover"
              data-ai-hint={weatherDataAiHint}
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
          Location and detailed weather requires permissions & external APIs. Displaying sensor data.
        </p>
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;

    