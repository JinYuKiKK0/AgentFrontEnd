import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import type { components } from '@/types/openapi'

type ChatSessionVO = components['schemas']['ChatSessionVO']

// 创建会话
export function useCreateSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, title }: { userId: string; title?: string }) => {
      const { data, error } = await apiClient.POST('/session/create', {
        params: {
          query: { userId, title }
        }
      })
      
      if (error) throw new Error('创建会话失败')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })
}

// 获取会话列表
export function useChatSessions(userId: string, lastConversationId?: string) {
  return useQuery({
    queryKey: ['sessions', userId, lastConversationId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/session/list', {
        params: {
          query: { 
            userId, 
            lastConversationId,
            pageSize: 20
          }
        }
      })
      
      if (error) throw new Error('获取会话列表失败')
      return data?.data || []
    },
    enabled: !!userId
  })
}

// 删除会话
export function useDeleteSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      const { data, error } = await apiClient.DELETE('/session/delete', {
        params: {
          query: { userId, conversationId, clearChatMemory: true }
        }
      })
      
      if (error) throw new Error('删除会话失败')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })
}

// 批量删除会话
export function useBatchDeleteSessions() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, conversationIds }: { userId: string; conversationIds: string[] }) => {
      const { data, error } = await apiClient.DELETE('/session/batch-delete', {
        params: {
          query: { userId, clearChatMemory: true }
        },
        body: conversationIds
      })
      
      if (error) throw new Error('批量删除会话失败')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })
} 