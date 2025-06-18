
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]" // Adjust height as needed
      >
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center gap-2 text-primary mx-auto">
              <Settings2 size={32} />
              <CardTitle className="text-3xl font-bold">Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              This page is currently under construction.
            </p>
            <p className="text-muted-foreground mt-2">
              Settings and configurations will be available here in a future update.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
