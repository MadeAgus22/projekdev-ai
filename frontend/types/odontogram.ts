export type ToothCondition = "normal" | "caries" | "filling" | "missing" | "crown" | "root-canal" | "implant"

export interface ToothHistoryEntry {
  date: string
  doctor: string
  from: ToothCondition
  to: ToothCondition
  note: string
}

export interface ToothData {
  condition: ToothCondition
  treatment?: string
  surfaces?: Record<string, string>
  history?: ToothHistoryEntry[]
}
