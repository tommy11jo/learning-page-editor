import axios from "axios"
import { MCQData } from "../components/MCQModal"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface Submission {
  question_id: string
  selected_answer: number
}

export interface SubmissionResponse {
  message: string
  is_correct: boolean
}

export interface MCQRequestBody {
  id: string
  question: string
  options: string[]
  correct_answer: number
}

export const mcqApi = {
  upsertQuestion: async (question: MCQData): Promise<{ message: string }> => {
    if (question.id === undefined || question.correctAnswer === undefined) {
      throw new Error("Question ID and correct answer are required")
    }
    const requestBody: MCQRequestBody = {
      id: question.id,
      question: question.question,
      options: question.options,
      correct_answer: question.correctAnswer,
    }

    const response = await axios.post<{ message: string }>(
      `${API_BASE_URL}/multi_choice_question/upsert`,
      requestBody
    )
    return response.data
  },

  submitAnswer: async (submission: Submission): Promise<SubmissionResponse> => {
    const response = await axios.post<SubmissionResponse>(
      `${API_BASE_URL}/multi_choice_question/submit`,
      submission
    )
    return response.data
  },

  deleteQuestion: async (
    questionId: string
  ): Promise<{ message: string; deleted_question: MCQData }> => {
    const response = await axios.delete<{
      message: string
      deleted_question: MCQData
    }>(`${API_BASE_URL}/multi_choice_question/delete/${questionId}`)
    return response.data
  },

  getSubmissions: async (): Promise<Submission[]> => {
    const response = await axios.get<Submission[]>(
      `${API_BASE_URL}/multi_choice_question/submissions`
    )
    return response.data
  },
}
