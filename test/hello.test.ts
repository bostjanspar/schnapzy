import { describe, it, expect } from 'vitest'

describe('Hello World', () => {
  it('should say hello', () => {
    const message = 'Hello, World!'
    expect(message).toBe('Hello, World!')
  })

  it('should do basic math', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('async hello')
    expect(result).toBe('async hello')
  })
})
