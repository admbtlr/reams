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
