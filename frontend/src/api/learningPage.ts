import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface LearningPage {
  content: string
}

export const learningPageApi = {
  upsertLearningPage: async (
    page: LearningPage
  ): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>(
      `${API_BASE_URL}/learning_page/upsert`,
      page
    )
    return response.data
  },

  getLearningPage: async (): Promise<LearningPage> => {
    const response = await axios.get<LearningPage>(
      `${API_BASE_URL}/learning_page/`
    )
    return response.data
  },
}
