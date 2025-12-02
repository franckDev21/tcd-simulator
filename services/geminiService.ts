import { CorrectionResult } from "../types";

// NOTE: This service is now purely a MOCK service. 
// It does not connect to Google Gemini API.
// It returns simulated data for demonstration purposes.

export const gradeWritingSubmission = async (prompt: string, submission: string): Promise<CorrectionResult> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        score: 450,
        level: "B2",
        feedback: "Ceci est une correction simulée (Mock). Votre texte a une bonne structure, mais attention à l'accord des participes passés. Le vocabulaire est varié et approprié au contexte professionnel.",
        correctedText: submission + "\n\n[CORRECTION SIMULÉE]\nVoici une version améliorée de votre texte :\nCher Monsieur,\nJe vous écris pour vous informer que je ne pourrai malheureusement pas assister à la réunion...",
        details: {
          grammar: "Quelques erreurs d'accord (pluriel/féminin) détectées dans le 2ème paragraphe.",
          vocabulary: "Bonne utilisation des connecteurs logiques (cependant, par conséquent).",
          coherence: "Le texte suit une progression logique claire."
        }
      });
    }, 2000);
  });
};