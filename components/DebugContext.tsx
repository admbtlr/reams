import React, { createContext, useState, useContext, useCallback } from 'react'


export const DebugContext = createContext<{
  logs: Array<{
    timestamp: string
    message: string
    data: any
  }>
  addLog: (message: string, data?: any) => void
  clearLogs: () => void
  isVisible: boolean
  toggleVisibility: () => void
} | null>(null)

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<Array<{
    timestamp: string
    message: string
    data: any
  }>>([])
  const [isVisible, setIsVisible] = useState(__DEV__) // Default visible only in dev

  const addLog = useCallback((message: string, data = {}) => {
    const timestamp = new Date().toISOString()
    setLogs(prevLogs => [...prevLogs, { timestamp, message, data }])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  return (
    <DebugContext.Provider value={{ logs, addLog, clearLogs, isVisible, toggleVisibility }}>
      {children}
    </DebugContext.Provider>
  )
}

export const useDebug = () => useContext(DebugContext)
