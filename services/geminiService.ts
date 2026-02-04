import { GoogleGenAI, Type } from "@google/genai";
import { FoodInputData, FoodAnalysisResult } from "../types";

// Initialize the API client
// Use process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-3-flash-preview";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    risk_score: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating spoilage risk. 0 is safe, 100 is spoiled.",
    },
    status: {
      type: Type.STRING,
      enum: ["SAFE", "CAUTION", "REJECT"],
      description: "The safety classification of the food.",
    },
    reason: {
      type: Type.STRING,
      description: "A short, concise explanation of why this risk score was assigned.",
    },
    handling_instruction: {
      type: Type.STRING,
      description: "Actionable advice for the user (e.g., 'Freeze immediately', 'Discard', 'Reheat thoroughly').",
    },
    remaining_safe_hours: {
      type: Type.NUMBER,
      description: "Estimated number of hours remaining until the food becomes unsafe to eat. Return 0 if already spoiled. Be conservative.",
    },
  },
  required: ["risk_score", "status", "reason", "handling_instruction", "remaining_safe_hours"],
};

export const checkFoodSpoilage = async (data: FoodInputData): Promise<FoodAnalysisResult> => {
  const prompt = `
    Analyze this food item for safety and donation suitability based on FDA/WHO guidelines.
    
    Food Details:
    - Name: ${data.name}
    - State: ${data.isCooked ? 'Cooked' : 'Raw/Uncooked'}
    - Time since preparation/harvest: ${data.hoursSincePrep} hours
    - Storage Temperature: ${data.storageTemp}°C
    
    Safety Rules to Apply:
    1. If risk_score > 70, status MUST be "REJECT".
    2. High protein food (meat/dairy/fish) > 4 hours at room temp (>20°C) is High Risk (REJECT).
    3. Cooked rice > 6 hours at room temp is High Risk (Bacillus cereus risk).
    4. "SAFE" implies it is good for immediate donation.
    5. "CAUTION" implies it needs immediate refrigeration or special handling but is likely edible.
    6. Estimate "remaining_safe_hours" carefully. If it's already spoiled, this is 0. If it's safe now but will spoil in 2 hours at current temp, return 2.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Food Safety Officer and Intelligent Food Redistribution Agent. Your goal is to prevent food poisoning while minimizing food waste. Be strict but fair based on scientific guidelines.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for deterministic/safety-critical output
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(text) as FoodAnalysisResult;
    return result;
  } catch (error) {
    console.error("Error analyzing food:", error);
    throw error;
  }
};