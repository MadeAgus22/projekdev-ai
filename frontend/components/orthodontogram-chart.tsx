"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Simplified tooth status options
const toothStatusOptions = [
  { value: "normal", label: "Normal" },
  { value: "caries", label: "Karies" },
  { value: "filled", label: "Tambalan" },
  { value: "missing", label: "Hilang" },
  { value: "crown", label: "Mahkota" },
  { value: "rct", label: "Perawatan Saluran Akar" },
  { value: "extraction", label: "Ekstraksi" },
]

// Initial tooth data
const initialTeethData = () => {
  const data: Record<string, { status: string; notes: string }> = {}

  // Adult teeth numbering (FDI/ISO System)
  for (let i = 11; i <= 18; i++) {
    data[i.toString()] = { status: "normal", notes: "" }
  }
  for (let i = 21; i <= 28; i++) {
    data[i.toString()] = { status: "normal", notes: "" }
  }
  for (let i = 31; i <= 38; i++) {
    data[i.toString()] = { status: "normal", notes: "" }
  }
  for (let i = 41; i <= 48; i++) {
    data[i.toString()] = { status: "normal", notes: "" }
  }

  return data
}

interface OrthodontogramChartProps {
  initialData?: Record<string, { status: string; notes: string }>
  readOnly?: boolean
  onDataChange?: (data: Record<string, { status: string; notes: string }>) => void
}

export function OrthodontogramChart({ initialData, readOnly = false, onDataChange }: OrthodontogramChartProps) {
  const [teethData, setTeethData] = useState<Record<string, { status: string; notes: string }>>(
    initialData && Object.keys(initialData).length > 0 ? initialData : initialTeethData(),
  )
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)

  // Update parent component when teeth data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(teethData)
    }
  }, [teethData, onDataChange])

  // Function to get tooth color based on status
  const getToothColor = (status: string) => {
    switch (status) {
      case "normal":
        return "#ffffff"
      case "caries":
        return "#ff6b6b"
      case "filled":
        return "#4dabf7"
      case "missing":
        return "#868e96"
      case "crown":
        return "#ffd43b"
      case "rct":
        return "#a5d8ff"
      case "extraction":
        return "#f783ac"
      default:
        return "#ffffff"
    }
  }

  // Function to handle tooth click
  const handleToothClick = (toothId: string) => {
    if (readOnly) return
    setSelectedTooth(toothId)
  }

  // Function to update tooth status
  const updateToothStatus = (status: string) => {
    if (selectedTooth) {
      const updatedTeethData = {
        ...teethData,
        [selectedTooth]: {
          ...teethData[selectedTooth],
          status,
        },
      }
      setTeethData(updatedTeethData)
    }
  }

  // Function to render a tooth
  const renderTooth = (toothId: string, x: number, y: number, isUpper: boolean) => {
    const status = teethData[toothId]?.status || "normal"
    const color = getToothColor(status)
    const isSelected = selectedTooth === toothId

    return (
      <g key={toothId} onClick={() => handleToothClick(toothId)} style={{ cursor: readOnly ? "default" : "pointer" }}>
        <circle
          cx={x}
          cy={y}
          r="10"
          fill={color}
          stroke={isSelected ? "#007bff" : "#ccc"}
          strokeWidth={isSelected ? 2 : 1}
        />
        <text x={x} y={isUpper ? y + 4 : y + 5} textAnchor="middle" style={{ fontSize: "8px", userSelect: "none" }}>
          {toothId}
        </text>
      </g>
    )
  }

  return (
    <Card className="w-[500px] p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Orthodontogram Chart</h2>
        <div>
          {selectedTooth && !readOnly && (
            <Select value={teethData[selectedTooth]?.status || "normal"} onValueChange={updateToothStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {toothStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <svg width="500" height="200">
        {/* Upper teeth */}
        {renderTooth("18", 25, 30, true)}
        {renderTooth("17", 65, 30, true)}
        {renderTooth("16", 105, 30, true)}
        {renderTooth("15", 145, 30, true)}
        {renderTooth("14", 185, 30, true)}
        {renderTooth("13", 225, 30, true)}
        {renderTooth("12", 265, 30, true)}
        {renderTooth("11", 305, 30, true)}

        {renderTooth("21", 345, 30, true)}
        {renderTooth("22", 385, 30, true)}
        {renderTooth("23", 425, 30, true)}
        {renderTooth("24", 465, 30, true)}
        {renderTooth("25", 505, 30, true)}
        {renderTooth("26", 545, 30, true)}
        {renderTooth("27", 585, 30, true)}
        {renderTooth("28", 625, 30, true)}

        {/* Lower teeth */}
        {renderTooth("48", 25, 150, false)}
        {renderTooth("47", 65, 150, false)}
        {renderTooth("46", 105, 150, false)}
        {renderTooth("45", 145, 150, false)}
        {renderTooth("44", 185, 150, false)}
        {renderTooth("43", 225, 150, false)}
        {renderTooth("42", 265, 150, false)}
        {renderTooth("41", 305, 150, false)}

        {renderTooth("31", 345, 150, false)}
        {renderTooth("32", 385, 150, false)}
        {renderTooth("33", 425, 150, false)}
        {renderTooth("34", 465, 150, false)}
        {renderTooth("35", 505, 150, false)}
        {renderTooth("36", 545, 150, false)}
        {renderTooth("37", 585, 150, false)}
        {renderTooth("38", 625, 150, false)}
      </svg>
    </Card>
  )
}
