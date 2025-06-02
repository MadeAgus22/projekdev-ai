"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TindakanFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any
  onSubmit: (data: any) => void
  isObat?: boolean
}

export function TindakanForm({ open, onOpenChange, initialData, onSubmit, isObat = false }: TindakanFormProps) {
  const [formData, setFormData] = useState(
    initialData ||
      (isObat
        ? {
            kode: "",
            nama: "",
            jumlah: "1",
            satuan: "Tablet",
            harga: "",
          }
        : {
            kode: "",
            nama: "",
            gigi: "",
            harga: "",
            diskon: "0",
          }),
  )

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  // Dummy data for treatments
  const tindakanOptions = [
    { kode: "T001", nama: "Konsultasi" },
    { kode: "T002", nama: "Scaling" },
    { kode: "T003", nama: "Tambal Amalgam" },
    { kode: "T004", nama: "Tambal Composite" },
    { kode: "T005", nama: "Ekstraksi Sederhana" },
    { kode: "T006", nama: "Ekstraksi Komplikasi" },
    { kode: "T007", nama: "Perawatan Saluran Akar" },
    { kode: "T008", nama: "Mahkota Porcelain" },
    { kode: "T009", nama: "Mahkota Metal" },
    { kode: "T010", nama: "Gigi Tiruan Sebagian" },
    { kode: "T011", nama: "Gigi Tiruan Penuh" },
    { kode: "T012", nama: "Pemasangan Kawat Gigi" },
    { kode: "T013", nama: "Kontrol Kawat Gigi" },
    { kode: "T014", nama: "Bleaching" },
    { kode: "T015", nama: "Trepanasi" },
  ]

  // Dummy data for medications
  const obatOptions = [
    { kode: "O001", nama: "Paracetamol 500mg" },
    { kode: "O002", nama: "Ibuprofen 400mg" },
    { kode: "O003", nama: "Amoxicillin 500mg" },
    { kode: "O004", nama: "Metronidazole 500mg" },
    { kode: "O005", nama: "Asam Mefenamat 500mg" },
    { kode: "O006", nama: "Cefadroxil 500mg" },
    { kode: "O007", nama: "Chlorhexidine Mouthwash" },
    { kode: "O008", nama: "Povidone Iodine" },
    { kode: "O009", nama: "Dexamethasone 0.5mg" },
    { kode: "O010", nama: "Lidocaine Gel" },
  ]

  // Dummy data for tooth numbers
  const gigiOptions = [
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
  ]

  // Dummy data for units
  const satuanOptions = ["Tablet", "Kapsul", "Botol", "Tube", "Ampul", "Vial", "Strip", "Box"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? `Edit ${isObat ? "Obat" : "Tindakan"}` : `Tambah ${isObat ? "Obat" : "Tindakan"}`}
            </DialogTitle>
            <DialogDescription>
              {initialData
                ? `Edit data ${isObat ? "obat" : "tindakan"} yang sudah ada`
                : `Tambahkan ${isObat ? "obat" : "tindakan"} baru ke rekam medis`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item">Pilih {isObat ? "Obat" : "Tindakan"}</Label>
              <Select
                value={formData.kode}
                onValueChange={(value) => {
                  const selected = (isObat ? obatOptions : tindakanOptions).find((item) => item.kode === value)
                  handleChange("kode", value)
                  handleChange("nama", selected?.nama || "")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Pilih ${isObat ? "obat" : "tindakan"}`} />
                </SelectTrigger>
                <SelectContent>
                  {(isObat ? obatOptions : tindakanOptions).map((item) => (
                    <SelectItem key={item.kode} value={item.kode}>
                      {item.kode} - {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isObat ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jumlah">Jumlah</Label>
                    <Input
                      id="jumlah"
                      type="number"
                      min="1"
                      value={formData.jumlah}
                      onChange={(e) => handleChange("jumlah", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="satuan">Satuan</Label>
                    <Select value={formData.satuan} onValueChange={(value) => handleChange("satuan", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih satuan" />
                      </SelectTrigger>
                      <SelectContent>
                        {satuanOptions.map((satuan) => (
                          <SelectItem key={satuan} value={satuan}>
                            {satuan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harga">Harga Satuan (Rp)</Label>
                  <Input
                    id="harga"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.harga}
                    onChange={(e) => handleChange("harga", e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="gigi">Nomor Gigi</Label>
                  <Select value={formData.gigi} onValueChange={(value) => handleChange("gigi", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih nomor gigi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">Tidak ada</SelectItem>
                      {gigiOptions.map((gigi) => (
                        <SelectItem key={gigi} value={gigi}>
                          {gigi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="harga">Harga (Rp)</Label>
                    <Input
                      id="harga"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.harga}
                      onChange={(e) => handleChange("harga", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diskon">Diskon (%)</Label>
                    <Input
                      id="diskon"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.diskon}
                      onChange={(e) => handleChange("diskon", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
