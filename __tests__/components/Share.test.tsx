import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import Share from '@/components/Share'
import * as Sentry from '@sentry/react-native'
import { ShareMenuReactView } from 'react-native-share-menu'
import SharedGroupPreferences from 'react-native-shared-group-preferences'

jest.mock('@sentry/react-native')
jest.mock('react-native-share-menu', () => ({
  ShareMenuReactView: {
    data: jest.fn()
  }
}))
jest.mock('react-native-shared-group-preferences', () => ({
  setItem: jest.fn(),
  getItem: jest.fn()
}))

describe('Share Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize Sentry', () => {
    render(<Share />)
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN
    })
  })

  it('should log error if fetching shared data fails', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log')
    ShareMenuReactView.data.mockRejectedValueOnce(new Error('Test error'))

    render(<Share />)

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('errrr', expect.any(Error))
    })
  })
})