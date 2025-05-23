import createClient from 'openapi-fetch'
import type { paths } from '@/types/openapi'

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_APP_API_BASE || 'http://localhost:8080',
})

export default apiClient 