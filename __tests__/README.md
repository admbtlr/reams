# Testing Guide

This directory contains tests for the Rizzle application. Here's a guide for writing effective tests.

## Running Tests

- Run all tests: `npm test`
- Run a specific test: `npm test -- -t "test name"`
- Run tests for a specific file: `npm test -- components/XButton.test.tsx`

## Test Structure

Tests are organized by component type:

- `components/` - UI component tests
- `reducers/` - Redux reducer tests
- `sagas/` - Redux-saga tests
- `utils/` - Utility function tests
- `backends/` - API/backend service tests

## Component Testing Approach

1. Start with simple components that have minimal dependencies
2. Use test doubles (mocks/stubs) for external dependencies
3. Test component rendering, user interactions, and state changes
4. Use `@testing-library/react-native` utilities for component testing

## Test Implementation Roadmap

### Phase 1: Simple UI Components
- [x] XButton
- [x] RizzleButton
- [x] Bar
- [x] TextButton
- [x] RadioButtons

### Phase 2: Form Components
- [x] SearchBar
- [x] SwitchRow
- [x] AccountCredentialsForm (tested with limitations)

### Phase 3: Complex UI Components
- [x] FeedIcon
- [x] CardCoverImage
- [x] ItemTitle

### Phase 4: Screen Components
- [x] FeedsScreen
- [ ] ItemsScreen
- [ ] SettingsScreen

### Phase 5: Navigation/Redux Integration
- [ ] App
- [ ] Navigation flows
- [ ] Redux integration tests

## Useful Patterns

### Testing components with Redux

```tsx
// Testing a component with Redux
import { render, fireEvent } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

const mockStore = configureStore([])
const store = mockStore({ /* initial state */ })

const { getByText } = render(
  <Provider store={store}>
    <ComponentToTest />
  </Provider>
)
```

### Testing with Supabase

When testing functions that use Supabase, the recommended approach is to mock the module containing the Supabase queries rather than mocking the Supabase client directly. Here's a robust pattern:

```typescript
// Example: Testing a function that uses Supabase
import { getSavedItems } from '../../storage/supabase'
import { createSavedItem } from '../../utils/test-helpers'

// Mock at the module level
jest.mock('../../storage/supabase', () => {
  const originalModule = jest.requireActual('../../storage/supabase')
  
  // Create sequence-based mocks for doQuery
  const mockDoQuery = jest.fn()
    // First query response
    .mockImplementationOnce(() => Promise.resolve({
      data: [
        { item_id: '1', saved_at: '2024-02-17T15:59:01.232Z' }
      ],
      error: null
    }))
    // Second query response
    .mockImplementationOnce(() => Promise.resolve({
      data: [{ _id: '1', title: 'Example Item', url: 'http://example.com' }],
      error: null
    }))
    // Default fallback for any additional calls
    .mockImplementation(() => Promise.resolve({
      data: [],
      error: null
    }))

  // Mock getUserId or other helpers
  const mockGetUserId = jest.fn().mockResolvedValue('mock-user-id')
  
  return {
    ...originalModule,
    doQuery: mockDoQuery,
    getUserId: mockGetUserId,
    // Re-export the original function being tested
    getSavedItems: originalModule.getSavedItems
  }
})

describe('getSavedItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should get saved items correctly', async () => {
    const items = await getSavedItems([/* test input */])
    
    // Assert on the results
    expect(items.length).toBe(1)
    expect(items[0]._id).toBe('1')
    expect(items[0].title).toBe('Example Item')
  })
})
```

#### Best Practices for Mocking Supabase

1. **Mock at the Module Level**: Mock the module that uses Supabase rather than the Supabase client
2. **Sequence-Based Mocking**: Use `mockImplementationOnce()` for predictable call sequences 
3. **Test the Function, Not the Mocks**: Export the actual function you're testing with mocked dependencies
4. **Clear Mocks Between Tests**: Use `jest.clearAllMocks()` in `beforeEach`
5. **Assertive Expectations**: Check results based on known mock inputs

This approach is more maintainable since your tests won't break when the underlying Supabase implementation changes, as long as the function behavior remains the same.

### Testing UUID functions

When testing functions that use UUIDs, it's best to mock the UUID implementation to ensure consistent test results:

```typescript
// In jest.setup.js or a specific test file
jest.mock('uuid', () => {
  const v4 = jest.fn(() => '00000000-0000-0000-0000-000000000000')
  const v5 = jest.fn(() => '00000000-0000-0000-0000-000000000000')
  v5.URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8' // Standard namespace for URLs
  return { v4, v5 }
})
```

Alternatively, you can directly mock the utility functions that use UUIDs:

```typescript
// In a specific test file
jest.mock('../../utils', () => {
  const originalModule = jest.requireActual('../../utils')
  return {
    ...originalModule,
    id: jest.fn(() => '00000000-0000-0000-0000-000000000000')
  }
})
```
