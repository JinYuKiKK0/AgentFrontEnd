import { useState, useEffect, useRef, useCallback } from 'react'

interface UseSSEOptions {
  onMessage?: (data: string) => void
  onError?: (error: Event) => void
  onComplete?: () => void
}

export function useSSE(url: string | null, options: UseSSEOptions = {}) {
  const [data, setData] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const { onMessage, onError, onComplete } = options

  const startStreaming = useCallback(() => {
    if (!url) return

    setIsLoading(true)
    setError(null)
    setData('')

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      const newData = event.data
      if (newData === '[DONE]') {
        eventSource.close()
        setIsLoading(false)
        onComplete?.()
        return
      }

      setData(prev => prev + newData)
      onMessage?.(newData)
    }

    eventSource.onerror = (event) => {
      eventSource.close()
      setIsLoading(false)
      setError('连接错误')
      onError?.(event)
    }

    eventSource.onopen = () => {
      console.log('SSE连接已建立')
    }
  }, [url, onMessage, onError, onComplete])

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopStreaming()
    }
  }, [stopStreaming])

  return {
    data,
    isLoading,
    error,
    startStreaming,
    stopStreaming,
  }
} 