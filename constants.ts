import { ModuleType, Question, ExamSession } from './types';

export const LEVELS = [
  { name: 'A1', min: 0, max: 100, color: '#ef4444' },
  { name: 'A2', min: 101, max: 200, color: '#f97316' },
  { name: 'B1', min: 201, max: 300, color: '#eab308' },
  { name: 'B2', min: 301, max: 400, color: '#22c55e' },
  { name: 'C1', min: 401, max: 500, color: '#3b82f6' },
  { name: 'C2', min: 501, max: 699, color: '#a855f7' },
];

export const MOCK_READING_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Lisez le document. Que veut dire ce panneau ?",
    assetUrl: "https://picsum.photos/600/300",
    options: [
      "Il est interdit de fumer.",
      "Il est interdit de manger.",
      "Il est interdit de stationner.",
      "Il est interdit de courir."
    ],
    correctAnswer: 2,
    points: 10
  },
  {
    id: 2,
    text: "Lisez le courriel. Pourquoi Marc écrit-il à Sophie ?",
    assetUrl: "https://picsum.photos/600/301",
    options: [
      "Pour l'inviter à un anniversaire.",
      "Pour annuler un rendez-vous.",
      "Pour demander des nouvelles.",
      "Pour postuler à un emploi."
    ],
    correctAnswer: 0,
    points: 15
  },
  {
    id: 3,
    text: "Quel est le ton de cet article de presse ?",
    assetUrl: "https://picsum.photos/600/302",
    options: [
      "Humoristique.",
      "Critique.",
      "Informatif.",
      "Polémique."
    ],
    correctAnswer: 2,
    points: 20
  }
];

export const MOCK_LISTENING_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Écoutez l'enregistrement. Où se passe la scène ?",
    assetUrl: "AUDIO_PLACEHOLDER",
    options: [
      "À la gare.",
      "Au restaurant.",
      "Dans une boulangerie.",
      "À la bibliothèque."
    ],
    correctAnswer: 2,
    points: 10
  },
  {
    id: 2,
    text: "Qu'est-ce que la femme demande ?",
    assetUrl: "AUDIO_PLACEHOLDER",
    options: [
      "L'heure.",
      "Son chemin.",
      "Le prix d'un article.",
      "Un rendez-vous."
    ],
    correctAnswer: 1,
    points: 15
  }
];

export const WRITING_PROMPTS: Question[] = [
  {
    id: 1,
    text: "Sujet : Vous avez reçu une invitation pour le mariage d'un ami, mais vous ne pouvez pas y aller. Écrivez un courriel pour refuser l'invitation, expliquer pourquoi et proposer une autre date pour se voir. (60 à 120 mots)",
    points: 100
  }
];

export const MOCK_HISTORY = [
  { id: '1', date: '2023-10-15', module: ModuleType.READING, score: 350, maxScore: 699, level: 'B2' },
  { id: '2', date: '2023-10-18', module: ModuleType.LISTENING, score: 280, maxScore: 699, level: 'B1' },
  { id: '3', date: '2023-10-20', module: ModuleType.WRITING, score: 450, maxScore: 699, level: 'C1' },
];