import Animated from 'react-native-reanimated'
import { runSpring } from 'react-native-redash'

const {
  Value, Clock, cond, eq, stopClock, set, clockRunning
} = Animated

// export interface SpringValue {
//   value: typeof Value;
//   clock: typeof Clock;
//   hasSprung: typeof Value;
//   hasSprungBack: typeof Value;
// }

const springConfig = () => ({
  toValue: new Value(0),
  damping: 15,
  mass: 1,
  stiffness: 200,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001
})

export const createValue = (val) => ({
  value: new Value(val),
  clock: new Clock(),
  hasSprung: new Value(0),
  hasSprungBack: new Value(0)
})

export const springBack = (springValue, from, to) => [
  cond(eq(springValue.hasSprung, 0), [
    stopClock(springValue.clock),
    set(springValue.hasSprung, 1)
  ]),
  spring(springValue, from, to, 'hasSprungBack'),
]

export const spring = (
  springValue,
  from,
  to,
  back = 'hasSprung'
) => cond(eq(springValue[back], 0), [
  set(
    springValue.value,
    runSpring(springValue.clock, from, to, springConfig())),
  cond(eq(clockRunning(springValue.clock), 0), set(springValue[back], 1))
])
