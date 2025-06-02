"use client"

import { useState, useRef } from "react"
import type { ToothCondition, ToothData } from "@/types/odontogram"
import { Tooth } from "./tooth"
import { ToothLegend } from "./tooth-legend"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, History, Printer } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface OdontogramProps {
  initialData?: Record<string, ToothData>
  onSave?: (data: Record<string, ToothData>) => void
  readOnly?: boolean
  doctorName?: string
}

export function Odontogram({
  initialData = {},
  onSave,
  readOnly = false,
  doctorName = "drg. Siti Aisyah",
}: OdontogramProps) {
  const [teethData, setTeethData] = useState<Record<string, ToothData>>(initialData)
  const [currentCondition, setCurrentCondition] = useState<ToothCondition>("caries")
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedToothForHistory, setSelectedToothForHistory] = useState<string | null>(null)
  const [odontogramHistory, setOdontogramHistory] = useState<
    Array<{
      id: string
      date: string
      doctor: string
      changes: Array<{
        tooth: string
        from: ToothCondition
        to: ToothCondition
        note: string
      }>
    }>
  >([])
  const printRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Definisi nomor gigi berdasarkan standar FDI (ISO 3950)
  const upperRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11]
  const upperLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28]
  const lowerLeftTeeth = [31, 32, 33, 34, 35, 36, 37, 38]
  const lowerRightTeeth = [48, 47, 46, 45, 44, 43, 42, 41]

  const handleToothClick = (toothId: number) => {
    if (readOnly) return

    const toothKey = toothId.toString()
    const oldCondition = teethData[toothKey]?.condition || "normal"

    setTeethData((prev) => {
      // Jika gigi sudah dipilih dengan kondisi yang sama, kembalikan ke normal
      if (prev[toothKey]?.condition === currentCondition) {
        const newData = { ...prev }
        newData[toothKey] = {
          ...newData[toothKey],
          condition: "normal",
          history: [
            ...(newData[toothKey]?.history || []),
            {
              date: new Date().toISOString().split("T")[0],
              doctor: doctorName,
              from: currentCondition,
              to: "normal",
              note: `Status gigi diubah menjadi Normal`,
            },
          ],
        }
        return newData
      }

      // Jika tidak, tambahkan atau perbarui kondisi gigi
      return {
        ...prev,
        [toothKey]: {
          ...prev[toothKey],
          condition: currentCondition,
          history: [
            ...(prev[toothKey]?.history || []),
            {
              date: new Date().toISOString().split("T")[0],
              doctor: doctorName,
              from: oldCondition,
              to: currentCondition,
              note: `Status gigi diubah menjadi ${getConditionLabel(currentCondition)}`,
            },
          ],
        },
      }
    })

    // Add to global odontogram history
    const newHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      doctor: doctorName,
      changes: [
        {
          tooth: toothKey,
          from: oldCondition,
          to: currentCondition,
          note: `Status gigi diubah menjadi ${getConditionLabel(currentCondition)}`,
        },
      ],
    }

    setOdontogramHistory([newHistoryEntry, ...odontogramHistory])

    toast({
      title: "Status gigi diperbarui",
      description: `Gigi ${toothKey} diubah menjadi ${getConditionLabel(currentCondition)}`,
    })
  }

  const handleSave = () => {
    if (onSave) {
      onSave(teethData)
    }

    toast({
      title: "Odontogram berhasil disimpan",
      description: "Data odontogram telah disimpan.",
    })
  }

  const handleReset = () => {
    setTeethData({})

    toast({
      title: "Odontogram direset",
      description: "Semua data odontogram telah dihapus.",
    })
  }

  // Handle view tooth history
  const handleViewToothHistory = (toothId: string) => {
    setSelectedToothForHistory(toothId)
    setIsHistoryModalOpen(true)
  }

  // Handle print odontogram
  const handlePrintOdontogram = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Gagal membuka jendela cetak",
        description: "Pastikan pop-up tidak diblokir oleh browser Anda.",
        variant: "destructive",
      })
      return
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Odontogram Pasien - RM-001234</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .patient-info {
              margin-bottom: 20px;
              border: 1px solid #ddd;
              padding: 10px;
              border-radius: 5px;
            }
            .patient-info table {
              width: 100%;
            }
            .patient-info td {
              padding: 5px;
            }
            .odontogram {
              margin-bottom: 20px;
            }
            .legend {
              display: flex;
              flex-wrap: wrap;
              margin-top: 10px;
            }
            .legend-item {
              display: flex;
              align-items: center;
              margin-right: 15px;
              margin-bottom: 5px;
            }
            .legend-color {
              width: 15px;
              height: 15px;
              margin-right: 5px;
              border: 1px solid #000;
            }
            .footer {
              margin-top: 30px;
              text-align: right;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Odontogram Pasien</h2>
            <p>Klinik Gigi Sehat</p>
          </div>
          
          <div class="patient-info">
            <table>
              <tr>
                <td width="150"><strong>Nama Pasien</strong></td>
                <td>: Ahmad Fauzi</td>
                <td width="150"><strong>No. RM</strong></td>
                <td>: RM-001234</td>
              </tr>
              <tr>
                <td><strong>Tanggal Lahir</strong></td>
                <td>: 15-05-1985</td>
                <td><strong>Jenis Kelamin</strong></td>
                <td>: Laki-laki</td>
              </tr>
              <tr>
                <td><strong>Tanggal Cetak</strong></td>
                <td>: ${new Date().toLocaleDateString("id-ID")}</td>
                <td><strong>Dokter</strong></td>
                <td>: ${doctorName}</td>
              </tr>
            </table>
          </div>
          
          <div class="odontogram">
            ${printContent.innerHTML}
          </div>
          
          <div class="legend">
            <h4>Keterangan:</h4>
            <div style="display: flex; flex-wrap: wrap; width: 100%;">
              ${[
                { value: "normal", label: "Normal", color: "#ffffff" },
                { value: "caries", label: "Karies", color: "#ef4444" },
                { value: "filling", label: "Tambalan", color: "#3b82f6" },
                { value: "missing", label: "Hilang", color: "#9ca3af" },
                { value: "crown", label: "Mahkota", color: "#facc15" },
                { value: "root-canal", label: "Perawatan Saluran Akar", color: "#bfdbfe" },
                { value: "implant", label: "Implan", color: "#22c55e" },
              ]
                .map(
                  (option) => `
                <div class="legend-item">
                  <div class="legend-color" style="background-color: ${option.color}"></div>
                  <span>${option.label}</span>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
          
          <div class="footer">
            <p>Tanggal: ${new Date().toLocaleDateString("id-ID")}</p>
            <br><br>
            <p>____________________</p>
            <p>${doctorName}</p>
          </div>
          
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 15px;">Cetak</button>
        </body>
      </html>
    `)

    printWindow.document.close()
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
  }

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:w-64">
            <Select value={currentCondition} onValueChange={(value) => setCurrentCondition(value as ToothCondition)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kondisi gigi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="caries">Karies</SelectItem>
                <SelectItem value="filling">Tambalan</SelectItem>
                <SelectItem value="missing">Hilang</SelectItem>
                <SelectItem value="crown">Mahkota</SelectItem>
                <SelectItem value="root-canal">Perawatan Saluran Akar</SelectItem>
                <SelectItem value="implant">Implan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              Riwayat
            </Button>
            <Button variant="outline" onClick={handlePrintOdontogram}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-950 border rounded-lg p-6" ref={printRef}>
        <div className="flex flex-col items-center">
          {/* Upper Teeth */}
          <div className="flex justify-center w-full mb-8">
            <div className="flex justify-end w-1/2 border-r border-dashed border-gray-300">
              {upperRightTeeth.map((toothId) => (
                <Tooth
                  key={toothId}
                  id={toothId}
                  position="upper"
                  condition={teethData[toothId.toString()]?.condition}
                  onClick={() => handleToothClick(toothId)}
                  readOnly={readOnly}
                />
              ))}
            </div>
            <div className="flex justify-start w-1/2">
              {upperLeftTeeth.map((toothId) => (
                <Tooth
                  key={toothId}
                  id={toothId}
                  position="upper"
                  condition={teethData[toothId.toString()]?.condition}
                  onClick={() => handleToothClick(toothId)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>

          {/* Tooth Numbers */}
          <div className="flex justify-center w-full mb-2">
            <div className="flex justify-end w-1/2 border-r border-dashed border-gray-300">
              {upperRightTeeth.map((toothId) => (
                <div key={toothId} className="w-8 text-center text-xs">
                  {toothId}
                </div>
              ))}
            </div>
            <div className="flex justify-start w-1/2">
              {upperLeftTeeth.map((toothId) => (
                <div key={toothId} className="w-8 text-center text-xs">
                  {toothId}
                </div>
              ))}
            </div>
          </div>

          {/* Lower Tooth Numbers */}
          <div className="flex justify-center w-full mt-2">
            <div className="flex justify-end w-1/2 border-r border-dashed border-gray-300">
              {lowerRightTeeth.map((toothId) => (
                <div key={toothId} className="w-8 text-center text-xs">
                  {toothId}
                </div>
              ))}
            </div>
            <div className="flex justify-start w-1/2">
              {lowerLeftTeeth.map((toothId) => (
                <div key={toothId} className="w-8 text-center text-xs">
                  {toothId}
                </div>
              ))}
            </div>
          </div>

          {/* Lower Teeth */}
          <div className="flex justify-center w-full mt-2">
            <div className="flex justify-end w-1/2 border-r border-dashed border-gray-300">
              {lowerRightTeeth.map((toothId) => (
                <Tooth
                  key={toothId}
                  id={toothId}
                  position="lower"
                  condition={teethData[toothId.toString()]?.condition}
                  onClick={() => handleToothClick(toothId)}
                  readOnly={readOnly}
                />
              ))}
            </div>
            <div className="flex justify-start w-1/2">
              {lowerLeftTeeth.map((toothId) => (
                <Tooth
                  key={toothId}
                  id={toothId}
                  position="lower"
                  condition={teethData[toothId.toString()]?.condition}
                  onClick={() => handleToothClick(toothId)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ToothLegend />

      {teethData && Object.keys(teethData).length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Gigi yang ditandai:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(teethData)
              .filter(([_, data]) => data.condition !== "normal")
              .map(([toothId, data]) => (
                <div
                  key={toothId}
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => handleViewToothHistory(toothId)}
                >
                  <div>
                    <span className="font-medium">Gigi {toothId}:</span> {getConditionLabel(data.condition)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewToothHistory(toothId)
                    }}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedToothForHistory ? `Riwayat Gigi ${selectedToothForHistory}` : "Riwayat Perubahan Odontogram"}
            </DialogTitle>
            <DialogDescription>
              {selectedToothForHistory
                ? "Riwayat perubahan status gigi yang dipilih"
                : "Riwayat perubahan status semua gigi"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue={selectedToothForHistory ? "tooth" : "all"}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">Semua Perubahan</TabsTrigger>
                <TabsTrigger value="tooth" disabled={!selectedToothForHistory}>
                  Gigi {selectedToothForHistory}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <ScrollArea className="h-[300px]">
                  {odontogramHistory.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">Belum ada riwayat perubahan</div>
                  ) : (
                    <div className="space-y-4">
                      {odontogramHistory.map((entry) => (
                        <Card key={entry.id}>
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{entry.date}</span>
                              </div>
                              <Badge variant="outline">{entry.doctor}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="py-0">
                            <ul className="space-y-2">
                              {entry.changes.map((change, idx) => (
                                <li key={idx} className="text-sm flex items-start gap-2">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                  </div>
                                  <div>
                                    <span className="font-medium">Gigi {change.tooth}: </span>
                                    <span>
                                      {getConditionLabel(change.from)} → {getConditionLabel(change.to)}
                                    </span>
                                    <p className="text-muted-foreground text-xs mt-1">{change.note}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="tooth">
                <ScrollArea className="h-[300px]">
                  {!selectedToothForHistory ||
                  !teethData[selectedToothForHistory] ||
                  !teethData[selectedToothForHistory].history ||
                  teethData[selectedToothForHistory].history!.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Belum ada riwayat perubahan untuk gigi ini
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teethData[selectedToothForHistory].history!.map((entry, idx) => (
                        <Card key={idx}>
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{entry.date}</span>
                              </div>
                              <Badge variant="outline">{entry.doctor}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-sm">
                              <span>
                                Status: {getConditionLabel(entry.from)} → {getConditionLabel(entry.to)}
                              </span>
                              <p className="text-muted-foreground text-xs mt-1">{entry.note}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedToothForHistory(null)
                setIsHistoryModalOpen(false)
              }}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getConditionLabel(condition: ToothCondition): string {
  const labels: Record<ToothCondition, string> = {
    normal: "Normal",
    caries: "Karies",
    filling: "Tambalan",
    missing: "Hilang",
    crown: "Mahkota",
    "root-canal": "Perawatan Saluran Akar",
    implant: "Implan",
  }
  return labels[condition] || condition
}
