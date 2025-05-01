import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

/**
 * 应用入口组件
 * @param Component 当前页面组件
 * @param pageProps 页面属性
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="基于AI的智能聊天助手" />
        <meta name="theme-color" content="#14b8a6" />
        <title>AI 聊天助手</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}