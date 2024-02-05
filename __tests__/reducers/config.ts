import { config, initialState } from '../../store/config/config'
import { TOGGLE_ONBOARDING } from '../../store/config/types'

describe('config reducer', () => {
  it('should go to onboarding mode if reams backend is removed', () => {
    const toggleOnboarding = config(initialState, {
      type: TOGGLE_ONBOARDING,
      isOnboarding: false
    })
    expect(toggleOnboarding).toEqual({
      ...initialState,
      isOnboarding: false
    })
    const unsetBackend = config(toggleOnboarding, {
      type: 'UNSET_BACKEND',
      backend: 'reams'
    })
    expect(unsetBackend).toEqual({
      ...initialState,
      isOnboarding: true
    })
  })

})
