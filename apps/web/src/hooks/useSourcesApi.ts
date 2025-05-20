import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SourceFile } from "../types.ts";

interface SourceResponse {
  files: SourceFile[]
}

interface QuestionRequest {
  question: string;
}

interface QuestionResponse {
  success: boolean;
  message?: string;
  answer?: string;
  context?: string;
}

const API_URL = import.meta.env.VITE_API_URL

const postQuestion = async ({ question }: QuestionRequest): Promise<QuestionResponse> => {
  const response = await fetch(`${API_URL}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  })

  if (!response.ok) {
    throw new Error('Failed to submit question')
  }

  return response.json()
}

export function useAskQuestion() {
  const queryClient = useQueryClient()

  return useMutation<QuestionResponse, Error, QuestionRequest>({
    mutationFn: postQuestion,
    onSuccess: () => {
      // Invalidate and refetch the sources query after a successful question submission
      queryClient.invalidateQueries({ queryKey: ['sources'] })
    },
  })
}

export const useSources = () => {
  return useQuery<SourceResponse>({
    queryKey: ['sources'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/sources`)
      if (!response.ok) {
        throw new Error('Failed to fetch sources')
      }
      return response.json()
    }
  })
}

export const useDownloadSource = () => {
  return useMutation({
    mutationFn: async (filename: string) => {
      const response = await fetch(`${API_URL}/sources/${filename}`)

      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // FIXME: Create a temporary anchor element to trigger the download
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  })
}
