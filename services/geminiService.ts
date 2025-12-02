import { GoogleGenAI } from "@google/genai";
import { CorrectionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const gradeWritingSubmission = async (prompt: string, submission: string): Promise<CorrectionResult> => {
  if (!process.env.API_KEY) {
    // Fallback mock if no API key is present
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          score: 450,
          level: "B2",
          feedback: "Bon travail global. Attention à l'accord des participes passés et à l'utilisation du subjonctif. Le vocabulaire est varié.",
          correctedText: submission + "\n\n[Correction simulée: Attention à l'accord ici...]",
          details: {
            grammar: "Quelques erreurs d'accord de genre et de nombre.",
            vocabulary: "Bon usage des connecteurs logiques.",
            coherence: "Le texte suit une structure logique claire."
          }
        });
      }, 2500);
    });
  }

  try {
    const systemPrompt = `
      Tu es un examinateur expert du TCF Canada. 
      Ton rôle est de corriger une expression écrite.
      Le barème est sur 699 points.
      Retourne UNIQUEMENT un JSON valide avec la structure suivante:
      {
        "score": number (0-699),
        "level": string (A1, A2, B1, B2, C1, C2),
        "feedback": string (commentaire global),
        "correctedText": string (le texte complet corrigé),
        "details": {
          "grammar": string (commentaire specifique grammaire),
          "vocabulary": string (commentaire specifique vocabulaire),
          "coherence": string (commentaire specifique coherence)
        }
      }
    `;

    const userContent = `Sujet: ${prompt}\n\nRéponse de l'étudiant:\n${submission}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userContent,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as CorrectionResult;

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      score: 0,
      level: "N/A",
      feedback: "Erreur lors de la correction automatique. Veuillez réessayer.",
      correctedText: submission,
      details: { grammar: "", vocabulary: "", coherence: "" }
    };
  }
};