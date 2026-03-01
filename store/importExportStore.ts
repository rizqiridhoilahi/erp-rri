import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  ImportEntityType, 
  ExportEntityType, 
  ExportFormat, 
  ExportSchedulerInput,
  ImportRow 
} from '@/lib/validations/import-export'

// Import History
export interface ImportHistory {
  id: string
  entityType: ImportEntityType
  filename: string
  uploadedAt: string
  totalRows: number
  successRows: number
  failedRows: number
  status: 'completed' | 'failed' | 'partial'
}

// Export History
export interface ExportHistory {
  id: string
  entityType: ExportEntityType
  format: ExportFormat
  filename: string
  exportedAt: string
  rowCount: number
  downloadUrl?: string
}

// Scheduled Export
export interface ScheduledExport extends ExportSchedulerInput {
  id: string
  createdAt: string
  lastRun?: string
  nextRun?: string
}

interface ImportExportState {
  // Import state
  importHistory: ImportHistory[]
  currentImport: {
    entityType: ImportEntityType | null
    file: File | null
    preview: ImportRow[]
    isProcessing: boolean
  }
  
  // Export state
  exportHistory: ExportHistory[]
  scheduledExports: ScheduledExport[]
  currentExport: {
    entityType: ExportEntityType | null
    format: ExportFormat
    isExporting: boolean
  }
  
  // Import actions
  setCurrentImport: (importData: Partial<ImportExportState['currentImport']>) => void
  addImportHistory: (history: ImportHistory) => void
  clearCurrentImport: () => void
  
  // Export actions
  setCurrentExport: (exportData: Partial<ImportExportState['currentExport']>) => void
  addExportHistory: (history: ExportHistory) => void
  addScheduledExport: (schedule: ScheduledExport) => void
  updateScheduledExport: (id: string, data: Partial<ScheduledExport>) => void
  removeScheduledExport: (id: string) => void
}

export const useImportExportStore = create<ImportExportState>()(
  persist(
    (set) => ({
      // Initial import state
      importHistory: [],
      currentImport: {
        entityType: null,
        file: null,
        preview: [],
        isProcessing: false,
      },
      
      // Initial export state
      exportHistory: [],
      scheduledExports: [],
      currentExport: {
        entityType: null,
        format: 'xlsx',
        isExporting: false,
      },
      
      // Import actions
      setCurrentImport: (importData) =>
        set((state) => ({
          currentImport: { ...state.currentImport, ...importData },
        })),
      
      addImportHistory: (history) =>
        set((state) => ({
          importHistory: [history, ...state.importHistory].slice(0, 50), // Keep last 50
        })),
      
      clearCurrentImport: () =>
        set(() => ({
          currentImport: {
            entityType: null,
            file: null,
            preview: [],
            isProcessing: false,
          },
        })),
      
      // Export actions
      setCurrentExport: (exportData) =>
        set((state) => ({
          currentExport: { ...state.currentExport, ...exportData },
        })),
      
      addExportHistory: (history) =>
        set((state) => ({
          exportHistory: [history, ...state.exportHistory].slice(0, 50), // Keep last 50
        })),
      
      addScheduledExport: (schedule) =>
        set((state) => ({
          scheduledExports: [...state.scheduledExports, schedule],
        })),
      
      updateScheduledExport: (id, data) =>
        set((state) => ({
          scheduledExports: state.scheduledExports.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),
      
      removeScheduledExport: (id) =>
        set((state) => ({
          scheduledExports: state.scheduledExports.filter((s) => s.id !== id),
        })),
    }),
    {
      name: 'import-export-storage',
    }
  )
)
