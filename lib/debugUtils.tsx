import  create  from 'zustand'

interface DebugState {
  isDebugMode: boolean
  logs: string[]
  toggleDebugMode: () => void
  addLog: (log: string) => void
  clearLogs: () => void
}

export const useDebugStore = create<DebugState>((set) => ({
  isDebugMode: false,
  logs: [],
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] }),
}))

export const debugLog = (message: string) => {
  const { isDebugMode, addLog } = useDebugStore.getState()
  if (isDebugMode) {
    console.log(`[DEBUG] ${message}`)
    addLog(`[${new Date().toISOString()}] ${message}`)
  }
}