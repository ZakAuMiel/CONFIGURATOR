export {}

declare global {
  interface Window {
    api: {
      openModelDialog(): Promise<string | null>
    }
  }
}


declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
