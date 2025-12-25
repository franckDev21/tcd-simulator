import api from './api';

export type FlagReason = 'review' | 'difficult' | 'unsure';

export interface FlaggedQuestion {
  id: number;
  question_id: number;
  exam_attempt_id: number | null;
  reason: FlagReason;
  notes: string | null;
  is_resolved: boolean;
  created_at: string;
  question: {
    id: number;
    text: string;
    type: string;
    choices: string[] | null;
    correct_answer: number | null;
    image_url: string | null;
    audio_url: string | null;
    points: number;
    exam_series?: {
      id: number;
      title: string;
      module_type: string;
    };
  };
}

export interface FlaggedQuestionCount {
  total: number;
  unresolved: number;
  resolved: number;
}

export interface FlagQuestionPayload {
  question_id: number;
  exam_attempt_id?: number;
  reason?: FlagReason;
  notes?: string;
}

export const flaggedQuestionsService = {
  /**
   * Get all flagged questions for the current user
   */
  async getAll(params?: { resolved?: boolean; reason?: FlagReason }): Promise<FlaggedQuestion[]> {
    const queryParams = new URLSearchParams();
    if (params?.resolved !== undefined) {
      queryParams.set('resolved', params.resolved.toString());
    }
    if (params?.reason) {
      queryParams.set('reason', params.reason);
    }
    const query = queryParams.toString();
    const response = await api.get<{ data: FlaggedQuestion[] } | FlaggedQuestion[]>(`/user/flagged-questions${query ? `?${query}` : ''}`);
    // Handle Laravel Resource wrapper (returns { data: [...] })
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data;
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get count of flagged questions
   */
  async getCount(): Promise<FlaggedQuestionCount> {
    const response = await api.get<FlaggedQuestionCount>('/user/flagged-questions/count');
    return response.data;
  },

  /**
   * Flag one or more questions for review
   */
  async flag(questions: FlagQuestionPayload[]): Promise<{ message: string; flagged_count: number }> {
    const response = await api.post<{ message: string; flagged_count: number }>('/user/flagged-questions', { questions });
    return response.data;
  },

  /**
   * Flag a single question (convenience method)
   */
  async flagOne(questionId: number, reason: FlagReason = 'review', notes?: string, examAttemptId?: number): Promise<{ message: string; flagged_count: number }> {
    return this.flag([{
      question_id: questionId,
      reason,
      notes,
      exam_attempt_id: examAttemptId
    }]);
  },

  /**
   * Mark a flagged question as resolved
   */
  async resolve(flaggedId: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/user/flagged-questions/${flaggedId}/resolve`);
    return response.data;
  },

  /**
   * Remove a flagged question
   */
  async remove(flaggedId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/user/flagged-questions/${flaggedId}`);
    return response.data;
  },

  /**
   * Clear all resolved flagged questions
   */
  async clearResolved(): Promise<{ message: string; deleted_count: number }> {
    const response = await api.delete<{ message: string; deleted_count: number }>('/user/flagged-questions/clear-resolved');
    return response.data;
  }
};
