import { config } from 'dotenv';
config();

import '@/ai/flows/generate-alert-summary.ts';
import '@/ai/flows/predict-potential-issues.ts';