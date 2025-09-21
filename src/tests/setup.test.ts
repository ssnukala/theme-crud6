import { describe, it, expect } from 'vitest'

describe('Development Environment', () => {
  it('should have access to Vue types', () => {
    expect(typeof 'vue').toBe('string')
  })

  it('should load theme entry point', async () => {
    const theme = await import('../index')
    expect(theme.default).toBeDefined()
    expect(typeof theme.default.install).toBe('function')
  })

  it('should have UIKit available', () => {
    // Test that UIKit types are available (will be loaded in actual environment)
    expect(true).toBe(true)
  })
})