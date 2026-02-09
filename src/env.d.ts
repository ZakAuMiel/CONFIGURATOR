// src/env.d.ts
export {}

declare global {
  interface Window {
    api: {
      openModelDialog(): Promise<{ name: string; data: Uint8Array } | null>
    }
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
