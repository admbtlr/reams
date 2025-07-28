/**
 * AnimationContext Tests
 *
 * Tests for the new Reanimated-based animation context system.
 * This verifies that our new animation infrastructure works correctly
 * before we start migrating components to use it.
 */

import React from 'react'
import { render } from '@testing-library/react-native'
import { Text, View } from 'react-native'
import {
  AnimationProvider,
  useAnimation,
  useAnimationValues,
} from '@/components/ItemCarousel/AnimationContext'

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const mockUseSharedValue = (initialValue) => ({
    value: initialValue
  })

  return {
    useSharedValue: mockUseSharedValue,
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    runOnJS: jest.fn((fn) => fn),
    interpolate: jest.fn(),
    Extrapolate: {
      CLAMP: 'clamp'
    }
  }
})

describe('AnimationContext', () => {
  describe('AnimationProvider', () => {
    test('provides animation context to children', () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAnimation()
        return <Text>Test</Text>
      }

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      )

      expect(contextValue).toBeDefined()
      expect(contextValue).toHaveProperty('horizontalScroll')
      expect(contextValue).toHaveProperty('verticalScrolls')
      expect(contextValue).toHaveProperty('headerVisibles')
      expect(contextValue).toHaveProperty('buttonsVisibles')
      expect(contextValue).toHaveProperty('currentIndex')
      expect(contextValue).toHaveProperty('scrollDirection')
      expect(contextValue).toHaveProperty('isScrolling')
      expect(contextValue).toHaveProperty('scrollVelocity')
    })

    test('initializes shared values with correct defaults', () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAnimation()
        return <Text>Test</Text>
      }

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      )

      expect(contextValue.horizontalScroll.value).toBe(0)
      expect(contextValue.verticalScrolls[0].value).toBe(0)
      expect(contextValue.headerVisibles[0].value).toBe(0) // visible by default
      expect(contextValue.buttonsVisibles[0].value).toBe(1) // visible by default
      expect(contextValue.currentIndex.value).toBe(0)
      expect(contextValue.scrollDirection.value).toBe(0) // no direction
      expect(contextValue.isScrolling.value).toBe(false)
      expect(contextValue.scrollVelocity.value).toBe(0)
    })
  })

  describe('useAnimation hook', () => {
    test('throws error when used outside provider', () => {
      const TestComponent = () => {
        useAnimation()
        return <Text>Test</Text>
      }

      // Suppress console.error for this test
      const originalError = console.error
      console.error = jest.fn()

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAnimation must be used within an AnimationProvider')

      console.error = originalError
    })

    test('returns context when used inside provider', () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAnimation()
        return <Text>Test</Text>
      }

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      )

      expect(contextValue).toBeDefined()
    })
  })

  describe('Animation helper hooks', () => {
    test('useAnimationValues returns all animation values', () => {
      let animationValues = null

      const TestComponent = () => {
        animationValues = useAnimationValues()
        return <Text>Test</Text>
      }

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      )

      expect(animationValues).toHaveProperty('horizontalScroll')
      expect(animationValues).toHaveProperty('verticalScrolls')
      expect(animationValues).toHaveProperty('headerVisibles')
      expect(animationValues).toHaveProperty('buttonsVisibles')
      expect(animationValues).toHaveProperty('currentIndex')
      expect(animationValues).toHaveProperty('scrollDirection')
      expect(animationValues).toHaveProperty('isScrolling')
      expect(animationValues).toHaveProperty('scrollVelocity')
    })
  })

  describe('Multiple components usage', () => {
    test('multiple components can access the same context', () => {
      let contextValue1 = null
      let contextValue2 = null

      const TestComponent1 = () => {
        contextValue1 = useAnimation()
        return <Text>Test1</Text>
      }

      const TestComponent2 = () => {
        contextValue2 = useAnimation()
        return <Text>Test2</Text>
      }

      render(
        <AnimationProvider>
          <View>
            <TestComponent1 />
            <TestComponent2 />
          </View>
        </AnimationProvider>
      )

      expect(contextValue1).toBeDefined()
      expect(contextValue2).toBeDefined()

      // Both components should get the same context reference
      expect(contextValue1.horizontalScroll).toBe(contextValue2.horizontalScroll)
      expect(contextValue1.verticalScroll).toBe(contextValue2.verticalScroll)
      expect(contextValue1.headerVisibles[0]).toBe(contextValue2.headerVisibles[0])
      expect(contextValue1.buttonsVisibles[0]).toBe(contextValue2.buttonsVisibles[0])
    })
  })

  describe('Context value stability', () => {
    test('context value remains stable across child component renders', () => {
      let contextValue1 = null
      let contextValue2 = null
      let renders = 0

      const TestComponent = ({ counter }) => {
        renders++
        const context = useAnimation()
        if (renders === 1) {
          contextValue1 = context
        } else if (renders === 2) {
          contextValue2 = context
        }
        return <Text>Render {renders} - Counter {counter}</Text>
      }

      // Keep the same provider, only rerender the children
      const { rerender } = render(
        <AnimationProvider>
          <TestComponent counter={1} />
        </AnimationProvider>
      )

      rerender(
        <AnimationProvider>
          <TestComponent counter={2} />
        </AnimationProvider>
      )

      expect(renders).toBe(2)
      expect(contextValue1).toBeDefined()
      expect(contextValue2).toBeDefined()

      // Note: With our mock, we can't test object reference stability
      // but we can test that the values are consistent
      expect(contextValue1.horizontalScroll.value).toBe(0)
      expect(contextValue2.horizontalScroll.value).toBe(0)
      expect(contextValue1.verticalScrolls[0].value).toBe(0)
      expect(contextValue2.verticalScrolls[0].value).toBe(0)
    })
  })
})

describe('AnimationContext Integration', () => {
  test('can be used with nested providers', () => {
    let outerContext = null
    let innerContext = null

    const OuterComponent = () => {
      outerContext = useAnimation()
      return (
        <AnimationProvider>
          <InnerComponent />
        </AnimationProvider>
      )
    }

    const InnerComponent = () => {
      innerContext = useAnimation()
      return <Text>Inner</Text>
    }

    render(
      <AnimationProvider>
        <OuterComponent />
      </AnimationProvider>
    )

    expect(outerContext).toBeDefined()
    expect(innerContext).toBeDefined()

    // Inner context should be different from outer context
    expect(outerContext.horizontalScroll).not.toBe(innerContext.horizontalScroll)
  })

  test('works with complex component hierarchies', () => {
    let contexts = []

    const TestComponent = ({ id }) => {
      const context = useAnimation()
      contexts[id] = context
      return <Text>Component {id}</Text>
    }

    render(
      <AnimationProvider>
        <View>
          <TestComponent id={0} />
          <View>
            <TestComponent id={1} />
            <View>
              <TestComponent id={2} />
            </View>
          </View>
        </View>
      </AnimationProvider>
    )

    expect(contexts).toHaveLength(3)
    expect(contexts[0]).toBeDefined()
    expect(contexts[1]).toBeDefined()
    expect(contexts[2]).toBeDefined()

    // All should have the same context reference
    expect(contexts[0].horizontalScroll).toBe(contexts[1].horizontalScroll)
    expect(contexts[1].horizontalScroll).toBe(contexts[2].horizontalScroll)
  })
})
