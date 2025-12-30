/// <reference types="vite/client" />

declare module '*.css' {
  const css: string
  export default css
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*?url' {
  const url: string
  export default url
}

declare module '*?raw' {
  const content: string
  export default content
}
