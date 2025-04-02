import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useDebug } from './DebugContext'

type LogEntry = {
  timestamp: string
  message: string
  data: Record<string, any>
}

interface DebugContextValue {
  logs: LogEntry[]
  addLog: (message: string, data?: any) => void
  clearLogs: () => void
  isVisible: boolean
  toggleVisibility: () => void
}

const DebugView: React.FC = () => {
  const debugContext = useDebug()

  if (!debugContext) {
    return null
  }

  const { logs, clearLogs, isVisible, toggleVisibility } = debugContext

  if (!isVisible) {
    // Small indicator that can be tapped to show debug info
    return (
      <TouchableOpacity
        style={styles.debugButton}
        onPress={toggleVisibility}
      >
        <Text style={styles.debugButtonText}>D</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.debugContainer}>
      <View style={styles.debugHeader}>
        <Text style={styles.debugTitle}>Debug Info</Text>
        <TouchableOpacity onPress={clearLogs}>
          <Text style={styles.debugAction}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleVisibility}>
          <Text style={styles.debugAction}>Hide</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.logContainer}>
        {logs.map((log: LogEntry, index: number) => (
          <View key={index} style={styles.logEntry}>
            <Text style={styles.logTime}>{log.timestamp.split('T')[1].split('.')[0]}</Text>
            <Text style={styles.logMessage}>{log.message}</Text>
            {Object.keys(log.data).length > 0 && (
              <Text style={styles.logData}>
                {JSON.stringify(log.data, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default DebugView

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 999,
  },
  debugHeader: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#111',
  },
  debugTitle: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  debugAction: {
    color: '#4285F4',
    marginLeft: 10,
  },
  logContainer: {
    flex: 1,
  },
  logEntry: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logTime: {
    color: '#888',
    fontSize: 12,
  },
  logMessage: {
    color: 'white',
    fontWeight: 'bold',
  },
  logData: {
    color: '#bbb',
    fontSize: 12,
  },
})
