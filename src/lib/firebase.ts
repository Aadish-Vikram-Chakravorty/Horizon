import { initializeApp, getApp, FirebaseApp, getApps } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;

// Check if Firebase app has already been initialized
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // if already initialized, use that one
}

const database: Database = getDatabase(app);

export { app, database };

// Example data structure in Firebase RTDB
/*
{
  "currentReadings": {
    "sensors": {
      "ldrBrightness": 70, // 0-1000 (lux)
      "humidity": 45,      // 0-100 %
      "temperature": 22,   // °C
      "waterLevel": 60,    // 0-100 %
      "soilMoisture": 30,  // 0-100 % (higher means wetter)
      "flameDetected": false,
      "waterShortage": false
    },
    "devices": {
      "light1": "auto", // "on", "off", "auto"
      "lightLDR": "off"  // "on", "off", "auto"
    }
  },
  "historicalData": {
    "soilMoisture": [
      { "timestamp": 1678886400000, "value": 60 },
      { "timestamp": 1678890000000, "value": 55 }
    ],
    "temperature": [
      { "timestamp": 1678886400000, "value": 21 },
      { "timestamp": 1678890000000, "value": 22 }
    ]
    // ... other sensor historical data
  }
}
*/
