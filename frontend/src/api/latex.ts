import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface LatexConversionRequest {
  text: string
}

export interface LatexConversionResponse {
  latex: string
}

export const latexApi = {
  englishToLatex: async (
    englishText: string
  ): Promise<LatexConversionResponse> => {
    const requestBody: LatexConversionRequest = {
      text: englishText,
    }

    const response = await axios.post<LatexConversionResponse>(
      `${API_BASE_URL}/english-to-latex/generate`,
      requestBody
    )
    return response.data
  },
}
