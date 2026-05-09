import { GoogleGenAI, Type } from "@google/genai";
import { Innings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMatchData = async (rawInput: string): Promise<Partial<Innings>> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze this IPL ball-by-ball performance data for Vaibhav Suryavanshi.
    Input Data: ${rawInput}
    
    Verified Baseline for Vaibhav (IPL 2025):
    - Total Runs: 252
    - Matches: 7
    - Strike Rate: 206.56
    - Major Accomplishment: 101 off 38 balls vs GT.

    Task:
    1. Compute aggregate runs, balls, boundaries.
    2. Compute strike rate.
    3. Breakdown stats by phase (Powerplay 1-6, Middle 7-15, Death 16-20).
    4. Compare performance with the baseline (SR 206.56).
    5. Generate a 2-line professional scouting note.
    6. Identify any "six-hitting zones" mentioned or implied by the flow of data.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          runs: { type: Type.INTEGER },
          balls: { type: Type.INTEGER },
          fours: { type: Type.INTEGER },
          sixes: { type: Type.INTEGER },
          strikeRate: { type: Type.NUMBER },
          dotBallPct: { type: Type.NUMBER },
          opposition: { type: Type.STRING },
          scoutingNote: { type: Type.STRING },
          phases: {
            type: Type.OBJECT,
            properties: {
              Powerplay: { 
                type: Type.OBJECT, 
                properties: { runs: { type: Type.INTEGER }, balls: { type: Type.INTEGER }, sr: { type: Type.NUMBER }, boundaries: { type: Type.INTEGER } },
                required: ["runs", "balls", "sr", "boundaries"]
              },
              Middle: { 
                type: Type.OBJECT, 
                properties: { runs: { type: Type.INTEGER }, balls: { type: Type.INTEGER }, sr: { type: Type.NUMBER }, boundaries: { type: Type.INTEGER } },
                required: ["runs", "balls", "sr", "boundaries"]
              },
              Death: { 
                type: Type.OBJECT, 
                properties: { runs: { type: Type.INTEGER }, balls: { type: Type.INTEGER }, sr: { type: Type.NUMBER }, boundaries: { type: Type.INTEGER } },
                required: ["runs", "balls", "sr", "boundaries"]
              },
            },
            required: ["Powerplay", "Middle", "Death"]
          }
        },
        required: ["runs", "balls", "fours", "sixes", "strikeRate", "scoutingNote", "phases"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {};
  }
};
