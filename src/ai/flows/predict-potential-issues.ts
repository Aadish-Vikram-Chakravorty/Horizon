'use server';

/**
 * @fileOverview AI-powered prediction of potential issues based on sensor data.
 *
 * - predictPotentialIssues - A function to predict potential issues.
 * - PredictPotentialIssuesInput - The input type for the predictPotentialIssues function.
 * - PredictPotentialIssuesOutput - The return type for the predictPotentialIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictPotentialIssuesInputSchema = z.object({
  historicalSensorData: z
    .string()
    .describe('Historical sensor data as a JSON string.'),
  sensorType: z.string().describe('The type of sensor data being analyzed.'),
});
export type PredictPotentialIssuesInput = z.infer<
  typeof PredictPotentialIssuesInputSchema
>;

const PredictPotentialIssuesOutputSchema = z.object({
  predictedIssue: z
    .string()
    .describe('A description of the predicted issue, if any.'),
  confidenceLevel: z
    .number()
    .describe('A confidence level (0-1) for the prediction.'),
  suggestedAction: z
    .string()
    .describe('A suggested action to mitigate the predicted issue.'),
});
export type PredictPotentialIssuesOutput = z.infer<
  typeof PredictPotentialIssuesOutputSchema
>;

export async function predictPotentialIssues(
  input: PredictPotentialIssuesInput
): Promise<PredictPotentialIssuesOutput> {
  return predictPotentialIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictPotentialIssuesPrompt',
  input: {schema: PredictPotentialIssuesInputSchema},
  output: {schema: PredictPotentialIssuesOutputSchema},
  prompt: `You are an AI assistant specializing in predicting potential issues in smart home environments based on historical sensor data.

You will receive historical sensor data and the sensor type as input. Analyze the data for trends and anomalies to predict potential issues.

Based on your analysis, provide a description of the predicted issue (if any), a confidence level (0-1) for the prediction, and a suggested action to mitigate the predicted issue.

Historical Sensor Data: {{{historicalSensorData}}}
Sensor Type: {{{sensorType}}}`,
});

const predictPotentialIssuesFlow = ai.defineFlow(
  {
    name: 'predictPotentialIssuesFlow',
    inputSchema: PredictPotentialIssuesInputSchema,
    outputSchema: PredictPotentialIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
