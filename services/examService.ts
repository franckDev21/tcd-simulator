import api from './api';

// API returns module_type as string codes ('CE', 'CO', 'EE', 'EO')
export type ModuleCode = 'CE' | 'CO' | 'EE' | 'EO';

export interface ExamSeries {
  id: number;
  title: string;
  description: string;
  module_type: ModuleCode;
  is_premium: boolean;
  question_count: number;
}

export interface ExamDetail extends ExamSeries {
  questions: ApiQuestion[];
}

export interface ApiQuestion {
  id: number;
  text: string;
  type: string;
  difficulty: number;
  points: number;
  choices: string[] | null;
  correct_answer: number | null;
  audio_url: string | null;
  image_url: string | null;
}

export interface UserExamHistory {
  id: number;
  exam_series_id: number;
  exam_title: string;
  module_type: string;
  score: number;
  max_score: number;
  level: string;
  completed_at: string;
  time_spent: number | null;
  correct_count: number;
  total_questions: number;
}

export interface ExamAttemptDetail {
  id: number;
  exam_title: string;
  module_type: string;
  score: number;
  max_score: number;
  level: string;
  feedback: { text: string } | null;
  corrected_text: string | null;
  time_spent: number | null;
  completed_at: string;
  questions: {
    id: number;
    text: string;
    choices: string[] | null;
    correct_answer: number | null;
    points: number;
    user_answer: number | null;
    answer_text: string | null;
    is_correct: boolean;
    image_url: string | null;
    audio_url: string | null;
  }[];
}

export const examService = {
  // Get all active exams
  async getAllExams(): Promise<ExamSeries[]> {
    const response = await api.get<ExamSeries[]>('/user/exams');
    return response.data;
  },

  // Get specific exam with questions
  async getExam(id: number | string): Promise<ExamDetail> {
    const response = await api.get<ExamDetail>(`/user/exams/${id}`);
    return response.data;
  },

  // Get user's exam history
  async getUserHistory(limit: number = 10): Promise<UserExamHistory[]> {
    const response = await api.get<UserExamHistory[]>(`/user/exams/history?limit=${limit}`);
    return response.data;
  },

  // Get detailed attempt result
  async getAttemptDetail(attemptId: number): Promise<ExamAttemptDetail> {
    const response = await api.get<ExamAttemptDetail>(`/user/exams/attempts/${attemptId}`);
    return response.data;
  },

  // Submit attempt
  async submitAttempt(data: {
    exam_series_id: number;
    score: number;
    max_score: number;
    level: string;
    time_spent?: number;
    feedback?: string;
    corrected_text?: string;
    answers?: { question_id: number; selected_choice_index?: number; answer_text?: string; is_correct?: boolean }[];
  }) {
    const response = await api.post<{ message: string; attempt_id: number }>('/user/exams/submit', data);
    return response.data;
  }
};
