
export enum ModuleType {
  READING = 'Compréhension Écrite',
  LISTENING = 'Compréhension Orale',
  WRITING = 'Expression Écrite',
  SPEAKING = 'Expression Orale'
}

export interface Question {
  id: number;
  text: string;
  options?: string[]; // For QCM
  correctAnswer?: number; // Index of correct option
  assetUrl?: string; // Image for reading, Placeholder for audio
  points: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  isPremium: boolean;
  subscriptionPlan?: 'daily' | 'weekly' | 'monthly';
  avatar?: string;
}

export interface ExamSession {
  moduleId: ModuleType;
  questions: Question[];
  duration: number; // in seconds
}

export interface UserResult {
  id: string;
  date: string;
  module: ModuleType;
  score: number;
  maxScore: number;
  level: string; // A1, A2, B1, B2, C1, C2
  feedback?: string; // For writing/speaking
  correctionJson?: any; // Detailed correction
  // New fields for detailed QCM correction
  questions?: Question[];
  userAnswers?: Record<number, any>;
}

export type ViewState = 'LANDING' | 'DASHBOARD' | 'PROFILE' | 'EDIT_PROFILE' | 'SUBSCRIPTION' | 'EXAM_RUNNER' | 'RESULTS' | 'SERIES_SELECTION' | 'CORRECTION' | 'ALL_PLANS' | 'CONTACT_SALES';

export interface CorrectionResult {
  score: number;
  level: string;
  feedback: string;
  correctedText: string;
  details?: {
    grammar: string;
    vocabulary: string;
    coherence: string;
  };
}