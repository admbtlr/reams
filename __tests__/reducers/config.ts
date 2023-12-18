import { config, initialState } from '../../store/config/config'

describe('config reducer', () => {
  it('should return the initial state', () => {
    const initial = config(initialState, {})
    console.log(JSON.stringify(initialState))
    expect(initial).toEqual(initialState)
  })

})
