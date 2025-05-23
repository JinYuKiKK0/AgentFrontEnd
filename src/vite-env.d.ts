/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_BASE: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 