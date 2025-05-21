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
}

const API_URL = import.meta.env.VITE_API_URL

// API functions
const fetchSources = async (): Promise<SourceResponse> => {
  const response = await fetch(`${API_URL}/sources`)
  if (!response.ok) {
    throw new Error('Failed to fetch sources')
  }
  return response.json()
}

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

// Custom hooks
export function useSources() {
  return useQuery<SourceResponse, Error>({
    queryKey: ['sources'],
    queryFn: fetchSources,
  })
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
