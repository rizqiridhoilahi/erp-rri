import { QueryClient } from '@tanstack/react-query'

export const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

let clientQueryClientInstance: QueryClient | undefined

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a query client once then reuse it
    if (!clientQueryClientInstance) clientQueryClientInstance = makeQueryClient()
    return clientQueryClientInstance
  }
}
