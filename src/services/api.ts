/**
 * API基础URL配置
 */
const API_BASE_URL = 'http://localhost:8080';

/**
 * SSE回调函数接口定义
 */
interface StreamCallbacks {
  /**
   * 接收到消息块时的回调
   * @param chunk 消息块内容
   */
  onMessage: (chunk: string) => void;
  /**
   * 发生错误时的回调
   * @param error 错误对象
   */
  onError: (error: Error) => void;
  /**
   * 连接关闭时的回调
   */
  onClose: () => void;
}

/**
 * 使用SSE发送消息到AI聊天接口并处理流式响应
 * @param prompt 用户输入的提示词
 * @param callbacks 包含onMessage, onError, onClose的回调对象
 * @param chatId 会话ID，用于标识当前会话
 * @returns 返回一个包含close方法的对象，用于手动关闭SSE连接
 */
export const sendMessageStream = (
  prompt: string,
  callbacks: StreamCallbacks,
  chatId: string
): { close: () => void } => {
  const url = `${API_BASE_URL}/ai/chat?prompt=${encodeURIComponent(prompt)}&chatId=${encodeURIComponent(chatId)}`;
  const eventSource = new EventSource(url);

  /**
   * 处理接收到的消息
   * @param event SSE消息事件
   */
  eventSource.onmessage = (event) => {
    // 后端不发送 [DONE]，直接处理收到的数据
    callbacks.onMessage(event.data);
  };

  /**
   * 处理错误事件
   * 主要用于捕获网络错误或连接中断。
   * 注意：EventSource在连接正常关闭时也可能触发onerror。
   * 我们需要区分是真正的错误还是流结束。
   * @param event SSE错误事件 (类型为 Event，更具体的错误信息可能需要检查网络状态或后端日志)
   */
  eventSource.onerror = (event) => {
    try {
      // 直接检查当前readyState，而不是从event.target获取
      // 这样更可靠，因为event.target可能在某些情况下不包含readyState
      const currentState = eventSource.readyState;
      
      console.log(`SSE 事件触发 onerror，当前状态: ${currentState}`);
      
      // 如果状态是CLOSED(0)，这是正常关闭，直接调用onClose回调
      if (currentState === EventSource.CLOSED) {
        console.log('SSE 连接已关闭 (通过 onerror 事件检测)');
        // 使用setTimeout确保在事件循环的下一个周期执行，避免潜在的状态冲突
        setTimeout(() => {
          callbacks.onClose();
        }, 0);
        return;
      }
      
      // 只有在尝试连接 (CONNECTING) 时发生错误，才认为是关键错误并通知上层
      // 注意：EventSource.CONNECTING = 0, EventSource.OPEN = 1, EventSource.CLOSED = 2
      if (currentState === 0) { // 使用数字0而不是EventSource.CONNECTING，因为可能存在常量定义问题
        // 检查是否真的是连接错误，而不是正常关闭
        // 如果是正常关闭，我们应该调用onClose而不是onError
        console.log('SSE 连接已关闭或正在连接');
        // 使用setTimeout确保在事件循环的下一个周期执行，避免潜在的状态冲突
        setTimeout(() => {
          callbacks.onClose();
        }, 0);
      } else if (currentState === 1) { // EventSource.OPEN
        // 如果连接是 OPEN 状态发生错误，可能是服务器端问题或网络波动
        console.warn('SSE 在 OPEN 状态下发生错误，可能即将关闭。');
      }

      // 无论如何，发生错误时都尝试关闭连接，以防万一
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close();
      }
    } catch (err) {
      // 捕获任何可能在错误处理过程中发生的异常
      console.error('SSE 错误处理过程中发生异常:', err);
      // 确保连接被关闭
      try {
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
        callbacks.onClose();
      } catch (closeErr) {
        console.error('关闭 SSE 连接时发生异常:', closeErr);
      }
    }
  };

  /**
   * 注意：EventSource 没有原生的 onclose 事件
   * 我们已经在 onerror 处理函数中处理了连接关闭的情况
   * 不需要额外的 error 事件监听器
   */

  // 返回一个手动关闭连接的方法
  return {
    close: () => {
      try {
        console.log(`手动关闭SSE连接，当前状态: ${eventSource.readyState}`);
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
          // 使用setTimeout确保在事件循环的下一个周期执行，避免潜在的状态冲突
          setTimeout(() => {
            callbacks.onClose(); // 确保手动关闭时也调用onClose
          }, 0);
          console.log('SSE 连接已手动关闭');
        }
      } catch (err) {
        console.error('手动关闭SSE连接时发生异常:', err);
        // 即使发生异常，也尝试调用onClose回调
        try {
          callbacks.onClose();
        } catch (callbackErr) {
          console.error('调用onClose回调时发生异常:', callbackErr);
        }
      }
    },
  };
};