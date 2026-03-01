import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { ApiResponse } from '@/types'

interface UseApiOptions {
  enabled?: boolean
  retry?: number | boolean
}

export const useApi = <T,>(
  key: string[],
  url: string,
  options?: UseApiOptions
) => {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<T>>(url)
      if (!data.success) {
        throw new Error(data.error || 'API Error')
      }
      return data.data!
    },
    ...options,
  })
}

export const useApiMutation = <T, V>(url: string, method: 'post' | 'put' | 'patch' | 'delete' = 'post') => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: V) => {
      let response
      if (method === 'delete') {
        response = await apiClient.delete<ApiResponse<T>>(url)
      } else {
        response = await apiClient[method]<ApiResponse<T>>(url, variables)
      }
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'API Error')
      }
      return response.data.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

export default useApi
