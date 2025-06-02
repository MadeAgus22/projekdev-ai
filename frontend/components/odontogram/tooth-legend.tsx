"use client"

import type { ToothCondition } from "@/types/odontogram"

export function ToothLegend() {
  const conditions: Array<{ value: ToothCondition; label: string; color: string }> = [
    {
      value: "normal",
      label: "Normal",
      color: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
    },
    { value: "caries", label: "Karies", color: "bg-red-500" },
    { value: "filling", label: "Tambalan", color: "bg-blue-500" },
    { value: "missing", label: "Hilang", color: "bg-gray-400" },
    { value: "crown", label: "Mahkota", color: "bg-yellow-400" },
    { value: "root-canal", label: "Perawatan Saluran Akar", color: "bg-blue-200" },
    { value: "implant", label: "Implan", color: "bg-green-500" },
  ]

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Keterangan:</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {conditions.map((condition) => (
          <div key={condition.value} className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-sm ${condition.color}`}></div>
            <span className="text-sm">{condition.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
