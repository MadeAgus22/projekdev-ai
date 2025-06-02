"use client"

import { cn } from "@/lib/utils"
import type { ToothCondition } from "@/types/odontogram"

interface ToothProps {
  id: number
  position: "upper" | "lower"
  condition?: ToothCondition
  onClick: () => void
  readOnly?: boolean
}

export function Tooth({ id, position, condition, onClick, readOnly = false }: ToothProps) {
  const getToothColor = (condition?: ToothCondition) => {
    switch (condition) {
      case "caries":
        return "fill-red-500"
      case "filling":
        return "fill-blue-500"
      case "missing":
        return "fill-gray-400"
      case "crown":
        return "fill-yellow-400"
      case "root-canal":
        return "fill-blue-200"
      case "implant":
        return "fill-green-500"
      default:
        return "fill-white dark:fill-gray-800"
    }
  }

  const getToothPath = () => {
    if (position === "upper") {
      return "M1,16 L1,6 C1,3.2 3.2,1 6,1 H26 C28.8,1 31,3.2 31,6 V16 L16,25 L1,16 Z"
    } else {
      return "M1,16 L1,26 C1,28.8 3.2,31 6,31 H26 C28.8,31 31,28.8 31,26 V16 L16,7 L1,16 Z"
    }
  }

  return (
    <div
      className={cn("w-8 h-10 flex items-center justify-center", !readOnly && "cursor-pointer hover:opacity-80")}
      onClick={readOnly ? undefined : onClick}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path
          d={getToothPath()}
          className={cn(getToothColor(condition), "stroke-gray-900 dark:stroke-gray-300")}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}
