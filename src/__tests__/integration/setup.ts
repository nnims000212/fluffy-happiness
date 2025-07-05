import '@testing-library/jest-dom'

// Global test setup
beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear()
  
  // Reset any mocks
  vi.clearAllMocks()
})